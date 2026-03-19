# PKN Portal App - AI Agent Context and Build Rules

## Project overview

This mobile app is the React Native companion for the existing Laravel 12 + Filament 5 portal.

The backend already has strong web-side domain logic for:

- phone-number login
- organization-aware membership
- event registration with package breakdowns
- invoices and payment proof flows
- notifications

The mobile app should not try to rebuild all of that on day one.

For a detailed breakdown of the app's user experience and screen transitions, see [UX Flow Guide.md](./UX%20Flow%20Guide.md).

## Recommended product architecture

Use a **Public-First Native** model:

- **Public Screens (Native - No Login Required):**
  - Home Dashboard (Public view)
  - Event Discovery (List and Detail)
  - News/Articles (List and Detail)
- **Authenticated Screens (Native):**
  - My Registrations (History and Management)
  - Event Registration (Native flow: Participant selection, Package selection)
  - Invoices (List and Detail)
  - Profile & Membership
  - Notifications
- **Hybrid Bridge (WebView Fallback):**
  - Initial Login (Hybrid)
  - Organization Management
  - Profile/Org Editing (Complex cases)
  - **Manual Fallback**: Any registration flow can fallback to WebView if needed via a dedicated "Manage in Web" button.

The key distinction is:
- **Core Experience** (dashboard, news, events, registrations) is **NATIVE**.
- **Complex Setup/Auth** (login, org management) is **HYBRID (WebView)**.
- **Robustness**: WebView serves as a safety fallback for native mutation screens.

## Build stack

- Framework: Expo + React Native
- Language: TypeScript
- Routing: Expo Router
- Networking: Axios
- State: Zustand with persist
- Storage:
  - auth token in `expo-secure-store`
  - cached app state in `react-native-mmkv` (preferred over AsyncStorage for 30x faster performance)
- Styling: React Native `StyleSheet`

## Environment constraints

The current development setup is Linux-first and should stay Expo-friendly.

Rules:
1. Do not require native Android or iOS project edits unless explicitly approved.
2. Prefer packages that work with standard Expo workflows.
3. Do not use `react-navigation` directly; use Expo Router patterns.

## Authentication rule (Hybrid)

Use a **Hybrid Login Strategy** for v1.

### Login Flow:
1. Native app opens a WebView to `/user/login`.
2. User authenticates via the portal's web form.
3. Native app detects success by observing a redirect to `/api/v1/auth/token-handoff`.
4. Native app extracts the `token` from the JSON response and closes the WebView.

This ensures:
- The app has a **Sanctum Bearer Token** for native API calls.
- The WebView has a **Session Cookie** for web-backed flows (registrations, profile edits).

## WebView bridge rule

When navigating from a native screen to a web-backed flow (e.g., event registration):

1. Call `GET /api/v1/webview/magic-link?redirect=...`.
2. Open the resulting one-time signed URL in a WebView.
3. Observe completion via redirect to `pknportal://action-success`.

## Data loading rule

Use **stale-while-revalidate** behavior for native screens.
1. Render cached state immediately.
2. Fetch fresh data in the background.
3. Update UI and cache on success.

## Suggested app structure

```text
pkn-portal-app/
├── app/
│   ├── _layout.tsx
│   ├── (tabs)/
│   │   ├── index.tsx (Dashboard)
│   │   ├── events.tsx
│   │   ├── invoices.tsx
│   │   └── profile.tsx
│   ├── auth/
│   │   └── hybrid-login.tsx (WebView wrapper)
│   ├── events/
│   │   └── [id].tsx
│   ├── news/
│   │   └── [id].tsx
│   ├── invoices/
│   │   └── [id].tsx
│   └── webview/
│       └── bridge.tsx (For magic-link flows)
├── src/
│   ├── components/
│   ├── services/
│   ├── store/
│   │   └── dashboardStore.ts (uses MMKV for 1ms cache loads)
│   └── types/

## Performance & Scalability Tips

1. **FlashList (instead of FlatList)**:
   - Use Shopify's `<FlashList>` for rendering lists, specifically for the **Events Discovery** tab.
   - It is significantly faster and prevents memory crashes when handling large datasets.

2. **React Native MMKV (instead of AsyncStorage)**:
   - Use `react-native-mmkv` for local storage; it is ~30x faster than standard `AsyncStorage`.
   - It plugs directly into Zustand via a custom storage object.
   - *Note*: MMKV requires a custom dev client (it does not work in standard Expo Go).
```

## Coding directives

When generating code for this app:

1. **Auth**: Do not build native login forms. Use the hybrid WebView bridge for initial authentication.
2. **Types**: Use TypeScript interfaces for all API contracts.
3. **BFF**: Use `GET /api/v1/mobile-dashboard` for the home screen to minimize round-trips.
4. **URLs**: Ensure all image and file paths are absolute URLs returned by the API.
5. **Flows**: Treat WebView flows as isolated wrappers, not mixed into normal screen logic.
