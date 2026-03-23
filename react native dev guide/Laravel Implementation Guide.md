# Laravel Filament Side: API & Native Implementation Plan

This document outlines the necessary changes and additions needed in the Laravel backend to support the PKN Portal Mobile Application (React Native).

## 1. Authentication

Since the mobile app uses a **Native Login** strategy:

1.  **Login Endpoint**: Implement `POST /api/v1/auth/login`.
    *   This endpoint must accept phone number and password, and return a Sanctum token.
    *   **Logic**: 
        ```php
        if (Auth::attempt($credentials)) {
            $user = auth()->user();
            $token = $user->createToken('mobile-app')->plainTextToken;
            return response()->json(['token' => $token, 'user' => $user]);
        }
        ```

## 2. Deprecated (WebView Bridge)

*(WebView bridge has been removed in favor of fully native implementations.)*

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
    - Implement `POST /api/v1/invoices/{invoice}/snap-token`.
    - Auth: `auth:sanctum`.
    - Logic: Call `InvoicePaymentService::createOrReuseSnapPayment($invoice)` and return just the `snap_token`.
- **Native Creation**: Creation of registrations is done completely via Native forms calling `POST /api/v1/registrations`.

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
