# Critical Gotchas and Edge Cases

## 1. Keep mobile auth and web auth separate

Filament uses cookie-based web auth.

The mobile app uses bearer tokens.

Do not mix those concerns. Mobile API routes should live in `routes/api.php` and use `auth:sanctum` where needed. WebView access should happen through the magic-link bridge, not by trying to copy browser cookies into the app manually.

## 2. Match the current login field

The current portal login is centered on `phone_number`, not an email-first workflow.

If the mobile guide, API, and UI assume email login, you will create unnecessary divergence from the Laravel app. Treat email as secondary account data unless the backend is intentionally redesigned.

## 3. Complex registration should stay web-backed first

The existing event registration flow is not a trivial one-screen form.

It includes package breakdowns, organization logic, and invoice side effects. If you force a full native rewrite too early, you will duplicate validation and risk inconsistent pricing or quota handling.

## 4. Absolute URLs matter

React Native cannot rely on relative asset paths like `/storage/...`.

API resources must emit full URLs for:

- event images
- organization logos
- downloadable files
- news banners

## 5. Handle WebView exit intentionally

Do not leave users on a web confirmation page after a successful mutation.

Every WebView-backed flow should have a defined exit URL pattern, and the native app should respond by:

1. closing the WebView
2. refreshing relevant stores
3. navigating the user to the right native screen

## 6. Notifications are two separate problems

There are two notification layers:

- in-app notification center from your Laravel database notifications
- optional push notifications to the device

The API guide covers the first. If you later need true push delivery, you will also need device token registration and a push provider strategy.

## 7. Payment platform policy still matters

If any registration or invoice flow represents digital goods rather than physical events or real-world services, app store rules become stricter.

Do not assume a WebView payment flow is automatically acceptable for every event type.

## 8. Offline support should be selective

Cache read-heavy data using **TanStack Query Persistence**:

- dashboard
- events
- news
- invoices summary

Do not cache mutable workflow state (like active form inputs) in ways that allow users to submit stale registration or payment data unless using optimistic updates.

## 9. Keep docs and routes aligned

The repository already contains signs of more than one API direction.

If the real implementation uses `/api/v1/auth/token-handoff`, the tests and docs should say that. If temporary aliases exist, document them as migration shims only.

## 10. Performance optimization: FlashList & MMKV

Do not use standard React Native `FlatList` or `AsyncStorage` for high-volume data.

- **FlashList**: Use Shopify's `<FlashList>` for the **Events Discovery** tab to prevent memory crashes and frame drops.
- **MMKV**: Use `react-native-mmkv` for local storage in `dashboardStore.ts`. It is 30x faster than `AsyncStorage` and can load cached dashboard data in ~1ms.
- **Caveat**: MMKV requires a custom dev client (it does not work in standard Expo Go). Commit to this transition only when the project moves beyond Expo Go for development.
