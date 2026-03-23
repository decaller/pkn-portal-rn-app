# PKN Portal Mobile API Specification v1

Base URL: `https://your-domain.com/api/v1`

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

### `GET /auth/me`

**Auth required:** yes (Bearer Token)

**Purpose:**
- Return the currently authenticated mobile user profile.

## 2. Deprecated (WebView bridge)

*(The WebView bridge has been removed, as the app is fully native now.)*

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

### `POST /registrations`
- **Auth required**: yes
- **Purpose**: Create a new event registration natively.
- **Payload**: `{ event_id, package_id, participants: [ { name, category, ... } ] }`

### `PUT /registrations/{id}`
- **Auth required**: yes
- **Purpose**: Update registration details (e.g., change package).

### `DELETE /registrations/{id}`
- **Auth required**: yes
- **Purpose**: Cancel a draft or unpaid registration.

## 7. Participants (Native CRUD)

### `GET /registrations/{id}/participants`
- **Auth required**: yes

### `POST /registrations/{id}/participants`
- **Auth required**: yes
- **Purpose**: Add a new participant to an existing registration.

### `PUT /participants/{participant_id}`
- **Auth required**: yes
- **Purpose**: Update participant info.

### `DELETE /participants/{participant_id}`
- **Auth required**: yes

## 8. Invoices

### `GET /invoices`

Auth required: yes

Purpose:

- list invoices for registrations visible to the current user

### `GET /invoices/{id}`

Auth required: yes

Purpose:

- show invoice line items, amounts, due date, and status

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

## 8. Notifications

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
