# Backend TODOs for Phase 2, 3 & 4 (Native App)

This document outlines the API endpoints and features that need to be implemented or verified on the Laravel backend to support the mobile app's native features.

## Phase 1: Public Content & Read-only APIs

- [x] **Dashboard API**
    - Implement `GET /api/v1/mobile-dashboard` to aggregate content for the home screen.
    - Response should include:
        - `featured_events`: Array of published events.
        - `latest_news`: Array of recent news articles.
        - `featured_documents`: Array of documents flagged as featured.
        - `testimonials`: Array of user testimonials.
        - `contact_info`: `{ phone, whatsapp_url }`.
        - `alerts`: Array of system alerts `{ id, type, title, message, action_route }`.
        - `stats`: `{ active_registrations, pending_payments }` (filtered for authenticated user if token present).

- [x] **Events Discovery API**
    - Implement `GET /api/v1/events` with pagination, search, category, and status filtering.
    - Implement `GET /api/v1/events/{id}` for full event details (including registration packages).
    - Implement `GET /api/v1/events/{id}/similar` to return related events.

- [x] **News/Articles API**
    - Implement `GET /api/v1/news` for paginated news list with absolute thumbnail URLs.
    - Implement `GET /api/v1/news/{id}` for full article content.

---

## Phase 2: Native Login & Identity

_The mobile app is now using a fully native login flow instead of a WebView bridge._

- [x] **Sanctum Authentication**
    - Ensure Laravel Sanctum is installed and configured for mobile token authentication.
    - Implement `POST /api/v1/auth/login` returning a plaintext token and user profile.
    - Implement `POST /api/v1/auth/logout` to revoke the token.
    - Implement `GET /api/v1/user` to get the authenticated user's details.

- [x] **Profile & User Management**
    - Implement `GET /api/v1/user/profile` to fetch profile summary and linked organizations.
    - Implement `PUT /api/v1/user/profile` for lightweight profile edits.

- [x] **Notifications API**
    - Implement `GET /api/v1/notifications` to list database notifications.
    - Implement `POST /api/v1/notifications/{id}/mark-read`.
    - Implement `POST /api/v1/notifications/mark-all-read`.

- [x] **Documents API (Authenticated)**
    - Implement `GET /api/v1/documents` with pagination, search, and category filtering.
    - **Requirement**: Return a `featured` array (most recent/flagged) alongside the paginated `documents` object.
    - Implement `GET /api/v1/documents/{id}` to fetch document details.
    - **Requirement**: Ensure items include `is_featured: boolean` and `file_url`.

## Phase 3: Native Registration & Participant Management

_Registration flows will be handled natively via API rather than redirecting to a web view._

- [x] **Registrations API**
    - Implement `GET /api/v1/registrations` to list event registrations for the authenticated user.
    - Implement `GET /api/v1/registrations/{id}` to fetch one registration in full detail.
    - Implement `POST /api/v1/registrations` to create a new registration (event_id, package_id, participants).
    - Implement `PUT /api/v1/registrations/{id}` to update registration details.
    - Implement `DELETE /api/v1/registrations/{id}` to cancel draft/unpaid registrations.
    - Implement `POST /api/v1/registrations/{id}/cancel` because the mobile detail screen uses this explicit cancel action.
    - **Requirement**: `GET /api/v1/registrations` may return a Laravel API Resource collection (`{ data: [...] }`), but each item must include at least `id`, `registration_number`, `event_id`, `status`, `total_amount`, `created_at`, `event`, and `participants`.
    - **Requirement**: `GET /api/v1/registrations/{id}` should match the shape used in [`9.json`](api_result/registrations/9.json), wrapped as `{ data: {...} }`, including `event`, `participants`, `participant_count`, `package_name` or `package_breakdown`, and payment-related fields when available.
    - > [!IMPORTANT]
    - > **Debugging "Empty Registrations" (Checklist):**
    - > 1. **Auth Scoping**: Ensure the `Registrations` query is filtered by `auth()->id()`.
    - > 2. **Token Validity**: The mobile app sends the token in the `Authorization: Bearer <token>` header. Verify Sanctum is correctly identifying the user.
    - > 3. **Data Presence**: Check the database for entries in the `registrations` table linked to the test user's ID.
    - > 4. **Response Format**: Ensure the API returns either a plain array or a standard Laravel Resource collection with `data`; do not return a non-standard wrapper shape.
    - > 5. **Relationships**: The app expects `event` and `participants` to be included in the response. Check if Eager Loading is implemented.

- [x] **Participants CRUD**
    - Implement `GET /api/v1/registrations/{id}/participants` to list participants.
    - Implement `POST /api/v1/registrations/{id}/participants` to add a new participant.
    - Implement `PUT /api/v1/registrations/{id}/participants/{participant_id}` to update a participant.
    - Implement `DELETE /api/v1/registrations/{id}/participants/{participant_id}` to remove a participant.

- [x] **Organizations API**
    - Implement `GET /api/v1/organizations` to list organizations the user belongs to.

---

## Phase 4: Invoices & Payments (Midtrans Snap)

_The mobile app will use a native WebView to display the Midtrans Snap payment page. The backend is responsible for creating transactions and handling payment webhooks._

- [x] **Midtrans PHP Library**
    - Install the official Midtrans PHP library: `composer require midtrans/midtrans-php`
    - Add Midtrans config to `config/midtrans.php` (or use `services.php`):
        - `server_key` — from Midtrans MAP dashboard
        - `client_key` — from Midtrans MAP dashboard
        - `is_production` — `false` for sandbox, `true` for live
        - `is_sanitized` — `true`
        - `is_3ds` — `true`

- [x] **Invoice API (Enhanced for Mobile)**
    - Verify `GET /api/v1/invoices` returns paginated invoices with `status` field (`unpaid`, `pending`, `paid`, `expired`, `cancelled`).
    - Verify `GET /api/v1/invoices/{id}` returns full detail including line items and `gross_amount`.
    - Verify `GET /api/v1/invoices/{id}/download` returns a `download_url` to a temporary PDF.

- [x] **Payment Charge Endpoint**
    - Create `app/Http/Controllers/Api/PaymentController.php` with a `charge()` method.
    - Register route: `POST /api/v1/payments/charge` (protected by `auth:sanctum`).
    - Logic:
        1. Accept `invoice_id` from the request.
        2. Validate the invoice exists, belongs to the current user, and has `status = unpaid`.
        3. Build the Midtrans transaction payload (`order_id`, `gross_amount`, `customer_details`, `item_details`).
        4. Call `\Midtrans\Snap::createTransaction($payload)` to get `redirect_url` and `token`.
        5. Return `{ success: true, redirect_url, token }`.

- [x] **Payment Webhook Endpoint**
    - Register route: `POST /api/v1/payments/webhook` (unauthenticated, excluded from CSRF protection in `VerifyCsrfToken`).
    - Logic:
        1. Receive Midtrans notification payload.
        2. Validate the `signature_key`: `sha512($order_id . $status_code . $gross_amount . $server_key)`.
        3. Map `transaction_status` to local Invoice `status` and save.
        4. Return `200 OK` always.
    - Register this URL in MAP: `Settings > Configuration > Payment Notification URL`.

- [x] **Environment Variables**
    - Add to `.env` and `.env.example`:
        ```
        MIDTRANS_SERVER_KEY=
        MIDTRANS_CLIENT_KEY=
        MIDTRANS_IS_PRODUCTION=false
        ```

## Note

Please ensure all API endpoints return JSON responses (e.g., using Laravel API Resources), handle validation errors correctly, and return absolute URLs for images and files.
