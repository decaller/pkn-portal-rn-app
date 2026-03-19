# Laravel Filament Side: API & Hybrid Implementation Plan

This document outlines the necessary changes and additions needed in the Laravel backend to support the PKN Portal Mobile Application (React Native).

## 1. Authentication & Token Handoff

Since the mobile app uses a **Hybrid Login** strategy:

1.  **Handoff Endpoint**: Implement `GET /api/v1/auth/token-handoff`.
    *   This endpoint must be wrapped in `web` middleware first (to detect the session cookie) and then return a Sanctum token.
    *   **Logic**: 
        ```php
        $user = auth()->user();
        $token = $user->createToken('mobile-app')->plainTextToken;
        return response()->json(['token' => $token, 'user' => $user]);
        ```
2.  **Redirect Rule**: In the web login logic (Filament's `Login` page), if a `source=mobile` query parameter is present, redirect to the token handoff endpoint after successful login.

## 2. WebView Bridge (Magic Link)

To handle the transition from native (Bearer) to web (Cookie) for complex actions:

1.  **Magic Link Generator**: Implement `GET /api/v1/webview/magic-link`.
    *   Auth: `auth:sanctum`.
    *   **Logic**: Generate a temporary signed URL to a web route that automatically logs the user in via session and redirects to the desired path.
2.  **Web Bridge Controller**: A controller to handle the signed URL, call `auth()->login($user)`, and redirect.

## 3. Resource API implementation

Expose the following resources using `rupadana/filament-api-service`:

### a. Events & News
- Use existing models and implement API Transformers/Resources.
- Ensure all image URLs are converted to absolute paths using `Storage::url()`.

### b. Documents
- Implement `GET /api/v1/documents`.
- Ensure category filtering is supported.
- Provide a direct download URL or metadata for the mobile app.

### c. Invoices & Registrations
- **Read-only** access via native API.
- **Payment Initiation**: 
    - Implement `GET /api/v1/invoices/{invoice}/snap-token`.
    - Auth: `auth:sanctum`.
    - Logic: Call `InvoicePaymentService::createOrReuseSnapPayment($invoice)` and return just the `snap_token`.
- **Hybrid Fallback**: Creation and payment can also be triggered via WebView (using Magic Link).

## 4. Global API Refinements

1.  **Absolute URLs**: 
    - Create a global helper or use Eloquent `Casts/Accessors` to ensure file paths are always absolute.
2.  **Versioning**: 
    - Ensure all routes are prefixed with `/api/v1/`.
3.  **Error Handling**:
    - Ensure all API exceptions return JSON payloads instead of HTML redirects (Laravel 12 handles this well by default if `Accept: application/json` is sent).

## 5. Security Context

1.  **Sanctum**: Use `HasApiTokens` trait in the `User` model.
2.  **Rate Limiting**: Apply strict rate limiting to the handoff and login endpoints.
3.  **CORS**: Update `config/cors.php` if the mobile app (in development) hits the backend from a non-standard origin.
