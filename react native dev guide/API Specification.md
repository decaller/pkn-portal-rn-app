# PKN Portal Mobile API Specification v1

Base URL: `https://your-domain.com/api/v1`

> [!NOTE]
> Updated API documentation from the backend is available in the [laravel code/scribe](file:///home/abuhafi/Project/pkn-portal/pkn-portal%20react-native/pkn-portal-rn-app/laravel%20code/scribe) directory.

Authentication:

- Laravel Sanctum bearer tokens for the mobile app
- cookie session only inside WebView flows after magic-link handoff

Response rules:

- JSON only
- use Laravel API Resources
- use absolute URLs for images and files
- return `null` for missing optional values

## 1. Authentication (Native Flow)

The mobile app uses a **Native Login Strategy**. The app sends credentials directly to the authentication endpoint and saves the returned token.

### `POST /auth/register`

**Auth required:** no

**Purpose:**

- Register a new user via their name, phone number, and password.

**Request Payload:**

```json
{
  "name": "Full Name",
  "phone_number": "08123456789",
  "email": "user@example.com",
  "password": "secretpassword",
  "password_confirmation": "secretpassword"
}
```

**Response:**

```json
{
  "success": true,
  "token": "plain-text-token",
  "user": {
    "id": 1,
    "name": "Full Name",
    "phone_number": "08123456789"
  }
}
```

### `POST /auth/login`

**Auth required:** no

**Purpose:**

- Authenticate a user via their phone number and password to receive a Sanctum Bearer Token.

**Request Payload:**

```json
{
  "phone_number": "08123456789",
  "password": "secretpassword"
}
```

**Response:**

```json
{
  "success": true,
  "token": "plain-text-token",
  "user": {
    "id": 1,
    "name": "User Name",
    "phone_number": "08123456789"
  }
}
```

### `POST /auth/logout`

**Auth required:** yes (Bearer Token)

**Purpose:**

- Revoke the current Sanctum token.

### `GET /auth/token-handoff`

**Auth required:** yes (Web Session)

**Purpose:**

- Exchange a valid web session for a Sanctum Bearer Token. This is used in the **Hybrid Login Flow** after a successful WebView login.

**Response:**

```json
{
  "success": true,
  "token": "plain-text-token",
  "user": {
    "id": 1,
    "name": "User Name",
    "phone_number": "08123456789"
  }
}
```

### `GET /auth/me`

**Auth required:** yes (Bearer Token)

**Purpose:**

- Return the currently authenticated mobile user profile.

## 2. Deprecated (WebView bridge)

_(The WebView bridge has been removed, as the app is fully native now.)_

## 3. Home dashboard

### `GET /mobile-dashboard`

Auth required: no

Purpose:

- aggregate content needed for the app home screen

Suggested payload:

```json
{
  "featured_events": [],
  "latest_news": [],
  "testimonials": []
}
```

## 4. Events

### `GET /events`

Auth required: no

Query params:

- `search`
- `page`
- `category`
- `status`

Purpose:

- return paginated published events suitable for mobile list rendering

### `GET /events/{id}`

Auth required: no

Purpose:

- return event details including content needed for the native detail screen

Recommended fields:

- title
- slug
- summary
- description
- event date
- location
- available spots
- registration availability
- registration package summary
- image URLs
- similiar events

### `GET /events/{id}/similar`

Auth required: no

Optional helper endpoint for detail screens.

## 5. News

### `GET /news`

Auth required: no

### `GET /news/{id}`

Auth required: no

Return article content plus absolute banner URLs.

### 5.4. Generate Webview Ticket
**Endpoint:** `POST /api/v1/webview-ticket`
**Description:** Generates a one-time use ticket to seamlessly log the user into the web portal via a Webview.
**Auth Required:** Yes (Sanctum Token)

**Response (200 OK):**
```json
{
  "ticket": "random_60_character_string_here"
}
```

**Usage in Mobile App:**
1. Call this endpoint to get the `ticket`.
2. Open the Webview pointing to `https://your-domain.com/webview-login?ticket={ticket}`.
3. The backend will consume the ticket, establish a secure web session cookie, and redirect to the dashboard.

---

## 6. Registrations

### `GET /registrations`

- **Auth required**: yes
- **Purpose**: List event registrations for the authenticated user. Information is formatted similarly to the Filament EventRegistrationsTable.
- **Query Params**: `per_page` (default 15)

### `GET /registrations/{id}`

- **Auth required**: yes
- **Purpose**: Get full details of a specific registration. Information is formatted similarly to the Filament EventRegistrationInfolist.

### `POST /registrations`

- **Auth required**: yes
- **Purpose**: Create a new event registration natively.
- **Payload**: `{ event_id, package_id, participants: [ { name, category, ... } ] }`

### `PUT /registrations/{id}`

*(Managed via WebView redirect to the web portal)*

### `DELETE /registrations/{id}`

*(Managed via WebView redirect to the web portal)*

## 7. Participants (Hybrid/WebView)

*(Participant management (add, edit, delete) is handled exclusively via the WebView redirect to the web portal. Native CRUD endpoints for participants are deprecated.)*

## 8. Invoices

### `GET /invoices`

Auth required: yes

Purpose:

- list invoices for registrations visible to the current user

Recommended fields per invoice item:

- `id`, `invoice_number`, `registration_id`
- `status` (enum: `unpaid`, `pending`, `paid`, `expired`, `cancelled`)
- `gross_amount`, `due_date`, `created_at`

### `GET /invoices/{id}`

Auth required: yes

Purpose:

- show invoice line items, amounts, due date, and payment status

Recommended response:

```json
{
  "id": 1,
  "invoice_number": "INV-2024-0001",
  "registration_id": 5,
  "status": "unpaid",
  "gross_amount": 500000,
  "due_date": "2024-04-30T23:59:59Z",
  "items": [
    { "description": "Event Package A", "quantity": 1, "price": 500000 }
  ],
  "created_at": "2024-04-01T10:00:00Z"
}
```

### `GET /invoices/{id}/download`

Auth required: yes

Recommended response:

```json
{
  "download_url": "https://your-domain.com/temporary/invoice.pdf"
}
```

Alternative:

- stream the PDF directly if you prefer

---

## 9. Payments (Midtrans Snap)

> Payments are now initiated from the Web portal via a WebView redirect. The mobile app no longer calls endpoints to request the Midtrans Snap token directly.

### `POST /payments/charge`

*(Deprecated: Payment initiation is handled via WebView redirect to the web portal where Midtrans Snap handles the checkout.)*

**Request Payload:**

```json
{
  "invoice_id": 1
}
```

**Response:**

```json
{
  "success": true,
  "redirect_url": "https://app.sandbox.midtrans.com/snap/v4/redirection/TOKEN",
  "token": "MIDTRANS_SNAP_TOKEN"
}
```

**Error response (invoice already paid or not found):**

```json
{
  "success": false,
  "message": "Invoice is already paid or does not exist."
}
```

---

### `POST /payments/webhook`

**Auth required:** no (Midtrans calls this endpoint directly. Validate the signature using `SignatureKey`.)

**Purpose:**

- Receive HTTP notification from Midtrans after a payment event (settlement, expire, cancel, deny).
- Update the local `Invoice` status accordingly.
- This endpoint must be registered in the Midtrans Merchant Administration Portal (MAP) under `Settings > Configuration > Payment Notification URL`.

**Midtrans Notification Payload (example):**

```json
{
  "transaction_id": "abc-123",
  "order_id": "INV-2024-0001",
  "gross_amount": "500000.00",
  "payment_type": "bank_transfer",
  "transaction_status": "settlement",
  "fraud_status": "accept",
  "signature_key": "..."
}
```

**Validation logic (Laravel):**

```php
// Validate the signature before processing:
$signatureKey = hash('sha512', $orderId . $statusCode . $grossAmount . config('midtrans.server_key'));
if ($signatureKey !== $request->signature_key) {
    return response()->json(['message' => 'Invalid signature'], 403);
}
```

**Status mapping:**

| Midtrans `transaction_status` | Local Invoice `status` |
| ----------------------------- | ---------------------- |
| `settlement`                  | `paid`                 |
| `pending`                     | `pending`              |
| `expire`                      | `expired`              |
| `cancel` / `deny`             | `cancelled`            |

**Response:** always return HTTP `200 OK` to acknowledge receipt.

---

## 10. Notifications

### `GET /notifications`

Auth required: yes

Purpose:

- list database notifications for the current user

### `POST /notifications/{id}/mark-read`

Auth required: yes

### `POST /notifications/mark-all-read`

Auth required: yes

## 9. Profile

### `GET /user/profile`

Auth required: yes

Purpose:

- return profile summary, linked organizations, and simple account fields

### `PUT /user/profile`

Auth required: yes

Purpose:

- support lightweight native profile edits if needed

If profile editing is needed, make sure to implement standard API updates.

## 10. Documents

### `GET /documents`

**Auth required:** yes (Bearer Token)

**Query params:**

- `category`
- `search`
- `page`

**Purpose:**

- Return paginated documents available to the user.

### `GET /documents/{id}`

**Auth required:** yes (Bearer Token)

**Response:**

```json
{
  "id": 1,
  "title": "Document Title",
  "description": "Short description",
  "file_url": "https://your-domain.com/storage/docs/file.pdf",
  "file_size": "2.1 MB",
  "file_type": "PDF",
  "created_at": "2024-03-18T12:00:00Z"
}
```

## 11. Organization Management (Native API)

Organization creation, member management, and profile editing will be implemented natively using backend APIs.

### `GET /organizations`

**Auth required:** yes (Bearer Token)

**Purpose:**

- List organizations the current user belongs to.

### Native Updates:

Native app uses standard REST API calls to fetch from, create, edit, or delete organizations instead of web views.

## 12. Formatting and safety rules

1. Never return raw Eloquent models directly.
2. Strip sensitive or admin-only fields.
3. Keep enums predictable and stable.
4. Use pagination for mobile lists.
5. Make file and image URLs absolute.
6. Keep mobile endpoints under `routes/api.php` with `auth:sanctum` where required.

## 13. Compatibility note

This spec intentionally standardizes on `/api/v1/...`.

If the repository currently contains exploratory tests for `/api/auth/...`, either:

1. update those tests to `/api/v1/auth/...`, or
2. provide temporary aliases during migration

Do not let the documentation and the actual route map diverge.
