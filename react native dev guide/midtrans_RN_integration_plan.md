# Midtrans React Native Integration Plan

> Bismillah, here is the detailed plan for integrating Midtrans Snap into the PKN Portal React Native app.

## Goal Description
Integrate Midtrans Snap to allow users to pay for their event registrations directly within the React Native application. This involves fetching a transaction token from the Laravel backend and displaying the Midtrans payment interface natively on mobile.

**Updated Dev Guide Files:**
- [API Specification.md](file:///home/abuhafi/Project/pkn-portal/pkn-portal%20react-native/pkn-portal-rn-app/react%20native%20dev%20guide/API%20Specification.md) — Sections 8 (Invoices) & 9 (Payments) updated with Midtrans charge + webhook endpoint specs.
- [TODO_BACKEND.md](file:///home/abuhafi/Project/pkn-portal/pkn-portal%20react-native/pkn-portal-rn-app/react%20native%20dev%20guide/TODO_BACKEND.md) — Phase 4 added with all Laravel backend tasks for payments.

## User Review Required
> [!IMPORTANT]
> **Integration Strategy**: Midtrans does *not* provide an official React Native SDK. Their official recommendation for hybrid/cross-platform environments is to use a `WebView` that loads the Midtrans `redirect_url`.
> 
> Therefore, this plan proposes using `react-native-webview`. It is the most robust and least error-prone method, eliminating the need to bridge unofficial third-party wrappers built over out-of-date native SDKs. 
> 
> Please review and confirm you are okay with this WebView strategy.
> 
> **Note on E-Wallets**: For payment methods like GoPay or ShopeePay that require jumping out to their respective apps, we will implement deep link handling within the WebView (`onShouldStartLoadWithRequest` pointing to `Linking.openURL`).

## Proposed Changes

### 1. Backend Integration (Laravel)
*(Note: These backend tasks should ideally be documented in [TODO_BACKEND.md](file:///home/abuhafi/Project/pkn-portal/pkn-portal%20react-native/pkn-portal-rn-app/react%20native%20dev%20guide/TODO_BACKEND.md) or handled independently).*

#### [MODIFY] `routes/api.php`
- Add authenticated endpoint for charging: `POST /api/v1/payments/charge`
- Add public, unauthenticated webhook endpoint: `POST /api/v1/payments/webhook`

#### [NEW] `app/Http/Controllers/PaymentController.php`
- `charge()`: Takes an `invoice_id` or `registration_id`, uses the Midtrans PHP library to request a Snap transaction, and returns the `transaction_token` and `redirect_url`.
- `webhook()`: Listens for Midtrans notifications (settlement, expire, cancel, deny) and updates the local Invoice/Registration status.

### 2. React Native Frontend Integration

#### [NEW] `src/services/api/payment.ts`
- Implement `api.post('/payments/charge', { invoice_id })` to fetch the Midtrans `redirect_url`.

#### [NEW] `src/app/invoices/index.tsx`
- Implement the Invoices List screen (Native).
- Fetch user's invoices/registrations and display payment status badges (Unpaid, Pending, Paid).

#### [NEW] `src/app/invoices/[id].tsx`
- Implement the Invoice Detail screen.
- Render invoice details, total amounts, and a prominent "Pay Now" button if the status is unpaid.

#### [NEW] `src/app/invoices/payment.tsx`
- A dedicated screen that hosts the `<WebView source={{ uri: redirectUrl }} />`.
- **Handling Redirects**: The WebView will monitor URL changes. If the user completes the payment, Midtrans redirects them to your configured `Finish URL`. The WebView intercepts this URL, closes the payment screen, and returns the user to the Invoice Detail screen.
- **Handling Deep Links**: Implement `onShouldStartLoadWithRequest` to catch schemes like `gojek://` or `shopeepay://` and forward them to the native device using React Native's `Linking` API.

## Verification Plan

### Automated Tests
- *None strictly required for the payment gateway UI layer*, but we will ensure Maestro tests are updated to take screenshots of the `invoices/index.tsx` and `invoices/[id].tsx` screens (using mocked unpaid invoices).

### Manual Verification
1. **Initiate Payment**: Log in to the app, navigate to an unpaid invoice, and click "Pay Now".
2. **WebView Launch**: Verify the app transitions to `payment.tsx` and successfully loads the Midtrans Simulator/Sandbox payment page.
3. **Sandbox Testing**: Choose a payment method (e.g., Credit Card or BCA Virtual Account) and complete the mock payment.
4. **Auto-Return**: Verify that upon payment completion, the WebView intercepts the Midtrans "Finish URL" and returns the user to the Invoice Detail screen.
5. **Webhook Confirmation**: Verify the backend receives the webhook from Midtrans and the Invoice status updates to "Paid" on the mobile app upon refreshing.
