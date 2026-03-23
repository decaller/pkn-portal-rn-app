# PKN Portal App - Feature Implementation Roadmap (MVP First)

This roadmap prioritizes a "Public Access First" strategy, allowing users to browse events and news without logging in. The implementation follows a fully native approach.

---

## Phase 1: Public Core (No-Login MVP)
**Goal:** Enable users to immediately browse PKN content without authentication.

- [x] **Project Setup**
  - [x] Initialize directory structure (`src/components`, `src/services`, `src/store`, `src/hooks`, `src/types`, `src/theme`).
  - [x] Install core dependencies: `axios`, `zustand`, `react-native-mmkv`, `@shopify/flash-list`, `expo-image`, `expo-blur`.
  - [x] **Form & Validation**: Install `react-hook-form` and `zod`.
  - [x] **i18n Setup**: Install `i18next` and `react-i18next`; configure `src/utils/i18n/index.ts`.
  - [x] **Theming Engine**: Install `react-native-paper` and `@material/material-color-utilities`.
  - [x] **Quality Control**: Set up Sentry, Jest, and `eslint-plugin-react-native-a11y`.
  - [x] **E2E & Flow Testing**: Set up Maestro (Mobile) and Playwright (Web) for automated screenshot flows.
  - [x] **CI/CD**: Configure EAS Build and set up GitHub Actions for automated deployments.
  - [x] Set up `axios` instance for public APIs with proper environment variable handling.

- [x] **Welcome & Onboarding**
  - [x] Implement `src/app/index.tsx` as the high-fidelity Welcome Screen from mockups.
  - [x] Handle "Get Started" (Guest access) and "Sign In" (Native Login) transitions.
- [x] **Native Public Dashboard (Guest Mode)**
  - [x] Implement `GET /api/v1/mobile-dashboard` (Public version/endpoint).
  - [x] Build Guest Dashboard UI (`guest_dashboard_fresh_variant_2` mockup).
  - [x] Implement skeleton loaders for a smooth first-load experience.
- [x] **Events & News Discovery**
  - [x] Implement Events List and News List screens (Native).
  - [x] Build Event Detail screen (`src/app/events/[id].tsx`) with native content layout.
  - [x] Build News Detail screen.
- [x] **Document Browsing (Public)**
  - [x] Implement `src/app/documents/index.tsx` (Public document browser mockup).
  - [x] Build "Featured Documents" carousel and "All Documents" list.
  - [x] Implement file search and basic download/viewing functionality.

---

## Phase 2: Native Login & Identity
**Goal:** Introduce authentication to allow personalized features.

- [ ] **Authentication Infrastructure**
  - [ ] Configure `axios` interceptors for Sanctum tokens.
  - [ ] Update `useAppStore` or create `useAuthStore` for secure persistent token storage (`expo-secure-store` or `react-native-mmkv`).
  - [ ] **Deep Linking**: Configure `app.json` for `pknportal://` scheme and universal links.

- [ ] **Native Login Strategy**
  - [ ] Implement `src/app/auth/login.tsx` (Native Login screen).
  - [ ] Implement API login integration with Laravel Sanctum (`/api/v1/auth/login` or similar).
  - [ ] Handle logout and token revocation logic.
- [ ] **Profile & Protected States**
  - [ ] Implement conditional UI for "Log In" prompts on restricted features (e.g., Register button).
  - [ ] **Refined Private Dashboard**: Implement the authenticated dashboard view (`refined_dashboard_screen` mockup) with user-specific alerts and action grid.
- [ ] **Contextual Document Browsing**
  - [ ] Implement document browser both as a separate menu item and integrated within Event detail screens.
- [ ] **Native Look & Feel Audit (Auth)**
  - [ ] Apply `android_ripple`, `Pressable` opacity, and `formSheet` presentation to all new screens.



---

## Phase 3: Native Registration & Participant Management
**Goal:** Enable users to natively create and manage event registrations, with a fallback for complex edge cases.

- [ ] **Native Registration Flows**
  - [ ] Implement `POST /api/v1/registrations` for creating new registrations natively.
  - [ ] Build Native Registration Management screen (Change package, Cancel registration).
  - [ ] Implement Participant Management (Add/Edit/Remove participants natively).
- [ ] **Infrastructure & Invoices**
  - [ ] Implement Native Invoice preview and status tracking within the registration flow.
  - [ ] Build detail views for linked participants and their metadata.
- [ ] **Direct Web Portal Link (Optional)**
  - [ ] Add "Open in Web Portal" button for users preferring the web version.

---

## Phase 4: Invoices & Payments (Midtrans)
**Goal:** Allow users to pay for their registrations.

- [ ] **Invoice Tracking**
  - [ ] Implement Invoices List and Invoice Detail screens (Native).
  - [ ] Show payment status badges (Unpaid, Pending, Paid).
- [ ] **Midtrans Integration**
  - [ ] Implement "Pay Now" flow: fetch Snap token from backend.
  - [ ] Integrate Midtrans Snap.
  - [ ] Implement automatic status refresh after payment.

---

## Phase 5: Notifications & Account Management
**Goal:** Finalize the user's personal context.

- [ ] **Notifications System**
  - [ ] Implement Notifications List screen.
  - [ ] Implement deep-linking for system alerts (e.g., tap payment reminder -> open Invoice).
- [ ] **Internationalization (i18n)**
  - [ ] Implement language switcher in Profile/Settings.
  - [ ] Audit all hardcoded strings and move to translation JSONs.

- [ ] **Organization Management**
  - [ ] Build Profile screen with organization context.
  - [ ] Implement "Edit Profile" and "Manage Org" natively using API.

---

## Phase 6: Performance, Polishing & SEO
**Goal:** Ensure a premium, production-ready experience.

- [ ] **Advanced Optimization**
  - [ ] Ensure all lists use `FlashList` with `estimatedItemSize`.
  - [ ] Finalize "Stale-While-Revalidate" caching using Zustand + MMKV.
  - [ ] **UI Polish**: Implement high-fidelity "Glassmorphism" wrappers (iOS) and Material You dynamic tonal palettes (Android).
  - [ ] Add micro-animations using `react-native-reanimated`.
- [ ] **Polish & Launch Prep**
  - [ ] **Native Audit Checklist**: Verify hardware back button handling, swipe-back on iOS, and native scroll behaviors.
  - [ ] **Accessibility Audit**: Final check for `accessibilityRole`, `accessibilityState`, and screen reader labels.
  - [ ] Refine dark mode and visual aesthetics based on `html_mockup` patterns.
  - [ ] Update README with final deployment and maintenance steps.


