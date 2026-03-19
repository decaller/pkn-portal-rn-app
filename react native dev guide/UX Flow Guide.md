# PKN Portal App - UX Flow Guide

This document defines the mobile user experience for the React Native application, including screen structure, UI design direction, and screen-to-screen interactions for the hybrid native + WebView architecture.

---

## 1. Core UX Strategy: "Public Native, Personal Native-First"

The app prioritizes instant accessibility for public content and a seamless native experience for personal data management.

- **SURFACE ENTRY (Native - No Login):**
  - Welcome / Onboarding Screen
  - Guest Dashboard
- **PUBLIC SURFACES (Native - No Login):**
  - Guest Dashboard (Fresh Variant)
  - Event Discovery (List and Detail)
  - News/Articles
  - Public Document Browser (Guest View)
- **PERSONAL SURFACES (Native - Authenticated):**
  - Refined Dashboard (Personalized)
  - Registration Management (Create, Edit, Participants)
  - Invoice Tracking
  - Notifications
  - Profile Summary
  - Private Document Access
- **WEB FALLBACK / COMPLEX FLOWS (Hybrid WebView):**
  - Initial Login
  - Organization Management
  - Profile/Org Editing (Complex cases)
  - **Fallback CTA**: A "Manage in Web Portal" button is present on all native registration/invoice screens for robustness.

---

## 2. UX Design Principles

### Primary product goals
- Make key information readable within 1-2 taps.
- Make status obvious without opening every detail page.
- Separate "browse" mode from "complete a portal task" mode.
- Keep destructive or important actions explicit and reversible where possible.

### Design language
- Clean, institutional, and trustworthy rather than promotional.
- Emphasize clarity of hierarchy: large titles, compact metadata, strong status chips.
- Use cards for grouped information, sticky action bars for primary decisions, and banners for high-priority alerts.

### Interaction model
- Tabs are for top-level destinations only.
- Details, articles, and drill-down records use stack navigation.
- WebView flows open as modal sessions so users understand they are entering a contained workflow.

---

## 3. Global Navigation Structure

The app uses **Bottom Tab Navigation** for primary areas and **Stack Navigation** for detail screens.

### Top-Level Tabs
- **Dashboard**: Dynamic summary based on auth state.
  - *Guest*: Focus on discovery, registration prompts, and news.
  - *Personal*: Focus on active registrations, alerts, and quick actions.
- **Events**: Searchable event discovery and detail browsing.
- **Documents**: Browse public and event-specific documents.
- **Registrations**: Registration history, status tracking, and invoices (Authenticated only).
- **Profile**: Personal account summary and settings (Authenticated only).

### Secondary Stack Screens
- Event Detail
- News Detail
- Invoice Detail
- Notifications
- Registration Detail
- WebView Bridge Modal
- Hybrid Login Modal

### Global Header Rules
- Top-level tabs use a contextual header title and optional right-side action.
- Detail screens use a back button, title, and share/bookmark/download actions where relevant.
- WebView modals always include:
  - left: close button
  - center: flow title
  - right: overflow/help if needed

---

## 4. Screen Inventory and Hierarchy

### A. Welcome Screen
**Purpose:** Provide a premium first impression and guide users to become participants.

**Detailed UI elements:**
- High-quality background illustration
- Glassmorphism feature cards: `Academic Events`, `Latest News`, `Global Network`
- Clear primary CTA: `Get Started` (leads to Guest Dashboard)
- Secondary CTA: `Sign In` (leads to Hybrid Login)
- Language picker and Help shortcut in header

**Behavior:**
- Opens on first launch if no token is found.
- Uses smooth transitions to the dashboard or login gate.

### B. Hybrid Login Screen (WebView)
**Purpose:** Authenticate without rebuilding the existing portal login flow.

**Core elements:**
- Full-screen WebView container
- Safe-area header with:
  - close button
  - title: `Login`
  - loading indicator during page transitions
- Optional connection error state with:
  - illustration or icon
  - short explanation
  - `Retry` button
- Web login form rendered by portal:
  - phone number field
  - password field
  - submit button
  - validation feedback

**Behavior:**
- App opens `/user/login`.
- App watches for redirect to `/api/v1/auth/token-handoff`.
- On success:
  - extract token
  - persist token in secure storage
  - close modal
  - route user to Dashboard
- On manual close before completion:
  - confirm if login is mid-process
  - return user to previous native state or exit gate

#### C. Dashboard Screen (Dual State)
**Purpose:** Give immediate value and show the most relevant state (Guest or Member).

#### 1. Guest Dashboard (Fresh Variant)
- Focus: "Discovery and Conversion"
- Elements: Featured events, trending news, and "Why Join?" prompts.

#### 2. Refined Dashboard (Member Mode)
- Focus: "Action and Management"
- Elements: High-priority alerts (e.g., Unpaid Invoices), Active Registration summary, and Quick Action grid:
  - `Browse Events`
  - `My Registrations`
  - `Notifications`
  - `Profile`

**Layout order (Refined):**
1. Greeting header with avatar and organization.
2. High-priority Banner area (Overdue Invoices).
3. Registration Status summary card (e.g., "2 Active Registrations").
4. Quick Action 2x2 grid.
5. Featured Events carousel.
6. Latest News vertical list.

**Primary interactions:**
- Tap notification icon -> Notifications screen
- Tap featured event -> Event Detail
- Tap news item -> News Detail
- Tap registration summary -> Registrations tab or Registration Detail
- Pull to refresh -> reload dashboard payload

### C. Events List Screen
**Purpose:** Help users find, scan, and filter events quickly.

**Detailed UI elements:**
- Search bar:
  - placeholder: `Search events`
  - clear action
- Filter row:
  - category chip
  - date/status chip
  - city/location chip if supported later
- Scrollable event cards (rendered via `<FlashList>` for high performance):
  - thumbnail/banner
  - title
  - date range
  - venue or city
  - short summary
  - registration availability chip
  - optional price/package starting point
- Empty state:
  - icon/illustration
  - message: no events match filters
  - `Reset Filters` action

**Primary interactions:**
- Search submit -> refresh event list
- Tap filter chip -> bottom sheet or inline picker
- Tap event card -> Event Detail
- Pull to refresh -> refetch list
- Reach end of list -> paginate

### D. Event Detail Screen
**Purpose:** Convert interest into registration while preserving trust and clarity.

**Layout order:**
1. Hero image
2. Event title and status
3. Key metadata block
4. Registration summary
5. Description/content
6. Package preview
7. Related or similar events
8. Sticky bottom CTA

**Detailed UI elements:**
- Hero section:
  - cover image
  - back button overlay
  - share action
- Identity block:
  - event title
  - organizer name if relevant
  - badge: `Open`, `Registered`, `Closed`, `Full`
- Metadata tiles:
  - date
  - time
  - location
  - remaining slots
- Registration card:
  - registration period
  - starting package price
  - summary text
  - note if registration requires organization data
- Description:
  - rich text content
  - agenda highlights
  - included benefits
- Package preview:
  - package name
  - price
  - participant limit summary
- Similar events section:
  - horizontal cards

**Sticky CTA states:**
- `Register Now` (Native flow) when registration is open.
- `Continue Registration` (Native flow) if draft exists.
- `View Registration` (Native flow) if already registered.
- `Manage in Web Portal` (WebView bridge) as a secondary fallback link.
- Disabled CTA with explanation when closed or offline.

**Primary interactions:**
- Tap `Register Now` -> Open Native Registration Step-thru (Participants -> Packages -> Summary).
- Tap `Manage in Web Portal` -> WebView Registration Flow (Magic-link).
- Tap similar event -> Event Detail for selected item.

### E. Registration Detail Screen
**Purpose:** Let users review what they submitted after returning from a WebView flow.

**Detailed UI elements:**
- Status header card:
  - registration number
  - event title
  - badge: `Draft`, `Submitted`, `Confirmed`, `Cancelled`
- Participant list:
  - names
  - role/category
  - completeness indicator
- Package summary card:
  - selected package
  - quantity
  - total cost
- Linked invoice block:
  - invoice number
  - payment status
  - CTA: `Open Invoice`
- Timeline:
  - created
  - awaiting payment
  - confirmed

**Primary interactions:**
- Tap linked invoice -> Invoice Detail
- Tap edit/manage if still web-backed -> open WebView with magic-link

### F. Registrations List Screen
**Purpose:** Give users a dedicated top-level place to track all event registrations and their next required actions.

**Detailed UI elements:**
- Summary strip:
  - total active registrations
  - unpaid or pending count
  - nearest upcoming event date
- Filter chips:
  - `All`
  - `Draft`
  - `Submitted`
  - `Awaiting Payment`
  - `Confirmed`
- Search bar:
  - search by event title or registration number
- Registration cards:
  - event title
  - registration number
  - event date
  - status badge
  - invoice/payment summary
  - CTA label: `Manage`, `View`, `Pay`
- Empty state:
  - no registrations yet
  - CTA: `Browse Events`

**Primary interactions:**
- Tap registration card -> Registration Detail (Native).
- Tap `Manage` -> Native Registration Edit (Change package/participants) with Web Fallback option.

### G. Documents Browser Screen
**Purpose:** Centralized access to event agendas, materials, and reports.

**Detailed UI elements:**
- Search bar for files
- Featured Documents carousel (Horizontal):
  - Thumbnail preview
  - File name and type/size
  - Inline `Download` action
- All Documents list:
  - Categorized by type (PDF, DOCX, XLSX)
  - Metadata: Date uploaded and size
  - Filter and Sort controls
- Empty state: "No documents available for this event."

**Primary interactions:**
- Tap file card -> Open system sharing/viewing sheet.
- Search file -> filter list in real-time.

### H. News List Screen
**Purpose:** Make portal news scannable and easy to revisit.

**Detailed UI elements:**
- Search field or simple list header
- Featured article card at top
- Standard article rows:
  - thumbnail
  - title
  - published date
  - excerpt
- Pull-to-refresh state

**Primary interactions:**
- Tap article -> News Detail

### H. News Detail Screen
**Purpose:** Provide readable long-form content.

**Detailed UI elements:**
- Hero image
- Article title
- Publish date and author/source line
- Rich content body
- Related article cards
- Share action in header

**Primary interactions:**
- Tap related article -> News Detail for selected article
- Back -> return to previous list position

### I. Invoice Detail Screen
**Purpose:** Help users understand what they owe and initiate payment.

**Layout order:**
1. Invoice status card
2. Amount summary
3. Line items
4. Payment session state (if active)
5. Action buttons

**Detailed UI elements:**
- Status card:
  - invoice number
  - badge: `Unpaid`, `Pending Payment`, `Paid`, `Expired`
  - due date
- Amount block:
  - subtotal
  - fees/discount
  - total payable
- Action area:
  - `Pay Now` / `Continue Payment` (Initiates Midtrans Snap)
  - `Download PDF`
  - `Contact Support`

**Primary interactions:**
- Tap `Pay Now` -> request Snap token -> open Midtrans Snap Modal (Native SDK or WebView)
- Tap `Download PDF` -> open temp file URL

#### [Slide] Invoice Payment Flow (Midtrans Snap)
1. User opens Registrations tab.
2. User taps a registration with `Unpaid` status.
3. Registration Detail opens.
4. User taps the linked invoice or `Pay Now` button.
5. App requests Snap token from `/api/v1/invoices/{id}/snap-token`.
6. App opens Midtrans Snap modal.
7. User completes payment on Midtrans gateway.
8. Midtrans sends webhook to backend.
9. App detects completion (via listener or polling) and refreshes state.
**Purpose:** Give users a single place to review system updates and reminders.

**Detailed UI elements:**
- Header actions:
  - `Mark all as read`
- Notification list items:
  - unread indicator dot
  - icon by type: payment, registration, event, general
  - title
  - body preview
  - relative timestamp
- Empty state:
  - no notifications yet

**Primary interactions:**
- Tap notification -> mark as read -> deep link to relevant screen
- Tap `Mark all as read` -> optimistic update with rollback on failure

### K. Profile Screen
**Purpose:** Provide identity, organization context, and account controls.

**Detailed UI elements:**
- Profile header:
  - avatar/initials
  - full name
  - phone number
  - membership or role badge
- Organization card:
  - organization name
  - member role
  - status
- Menu sections:
  - `Edit Profile`
  - `Manage Organization`
  - `My Registrations`
  - `Payment History / Invoices`
  - `Notifications`
  - `Help`
  - `Logout`
- App info footer:
  - version
  - environment if non-production

**Primary interactions:**
- Tap `Edit Profile` -> open WebView
- Tap `Manage Organization` -> open WebView
- Tap `My Registrations` -> Registrations tab or Registration Detail
- Tap `Logout` -> confirm -> revoke token -> return to login gate

### L. Reusable WebView Bridge Modal
**Purpose:** Host all authenticated write flows in a consistent wrapper.

**Detailed UI elements:**
- Safe-area modal shell
- Header:
  - close button
  - screen title derived from flow
  - loading progress bar/spinner
- WebView body
- Optional bottom helper bar:
  - `Having trouble?`
  - support/contact shortcut

**Behavior rules:**
- Show blocking loader while magic-link is being requested.
- Detect deep link success: `pknportal://action-success?...`
- Detect close/cancel and ask confirmation if form progress may be lost.
- Emit refresh event for affected native stores after success.

---

## 5. Screen-to-Screen Interaction Flows

### A. App Launch and Authentication Flow
1. User opens app.
2. Splash/loading gate checks secure token and cached user state.
3. If token exists and is valid:
   - route to Dashboard tab
4. If token is missing or invalid:
   - open Hybrid Login modal
5. User completes login in WebView.
6. App receives token handoff.
7. Modal closes.
8. Dashboard loads with native content.

### B. Dashboard Entry Flow
1. User lands on Dashboard.
2. App shows cached dashboard data or skeletons.
3. Dashboard fetches fresh content.
4. User can branch to:
   - Notifications
   - Event Detail
   - News Detail
   - Registrations tab / Registration Detail

### C. Event Registration Flow (Native-First)
1. User opens Events tab (Public).
2. User taps event card.
3. Event Detail opens (Public).
4. User taps `Register Now`.
5. If unauthenticated, prompts Hybrid Login modal.
6. Once logged in, app opens Native Registration wizard:
    - Step 1: Participant selection (Native list).
    - Step 2: Package selection (Native list).
    - Step 3: Summary and Submission. (POST to `/api/v1/registrations`).
7. User sees success state and linked Invoice Detail.
8. **Alternative**: If user hits a snag, they tap `Manage in Web` -> opens WebView Bridge.

### D. Invoice Payment Flow (Midtrans Snap)
1. User opens Registrations tab.
2. User taps a registration with unpaid or pending status.
3. Registration Detail opens.
4. User taps the linked invoice or 'Pay Now' button.
5. App requests Snap token from Backend API.
6. App opens Midtrans Snap modal (via Native SDK or WebView).
7. On payment completion, Midtrans notifies the backend via webhook.
8. App detects the completion (via listener or polling) and refreshes native state.
9. Invoice Detail updates to `Paid`.

### E. Notification Deep-Link Flow
1. User opens Notifications from Dashboard or Profile.
2. User taps a notification.
3. App marks it as read.
4. App opens the relevant destination based on payload:
   - event -> Event Detail
   - invoice -> Invoice Detail
   - registration -> Registration Detail
   - article -> News Detail
   - generic -> web or native fallback

### F. Profile Management Flow
1. User opens Profile tab.
2. User taps `Edit Profile` or `Manage Organization`.
3. App requests magic-link.
4. App opens WebView modal.
5. On successful save, portal redirects to success deep link.
6. App closes WebView and refreshes profile-related data.

### G. Logout Flow
1. User taps `Logout`.
2. Confirm dialog appears.
3. App calls logout endpoint and clears token/store.
4. User returns to unauthenticated gate.
5. Hybrid Login modal is shown again when needed.

---

## 6. Detailed Interaction Patterns

### Navigation transitions
- **Tab to tab**: instant switch, preserve scroll position where practical.
- **List to detail**: standard push transition.
- **Native to WebView**: full-screen modal slide-up.
- **WebView to native**: modal dismiss after success, cancel, or failure recovery.

### Touch targets and CTA rules
- Primary CTA should remain visible without requiring users to hunt for it.
- Use one primary CTA per screen section to reduce decision conflict.
- Secondary actions such as `Share`, `Download`, and `Help` should not visually compete with payment or registration actions.

### Confirmation rules
- Confirm before closing an in-progress WebView flow.
- Confirm logout.
- Avoid confirmation modals for simple navigation and safe read actions.

### Refresh rules
- Use optimistic refresh for notification read states.
- Use server-confirmed refresh after registration, payment proof, profile edit, and organization changes.

---

## 7. Component and State Guidelines

### Loading states
- First load with no cache:
  - use skeleton blocks for cards, metadata rows, and lists
- Revisit with cache:
  - show cached data immediately
  - refresh silently in background
- WebView launch:
  - show a blocking loader until signed URL is ready

### Empty states
- Must include:
  - simple icon or illustration
  - one-line explanation
  - one clear next action where appropriate

Recommended examples:
- No events: `Browse later or adjust your filters.`
- No registrations: `Your event registrations will appear here after you register.`
- No notifications: `Updates will appear here when something changes.`

### Error states
- Inline error for non-blocking list failures
- Full-page error when no usable content exists
- Toast/snackbar for transient action failures
- Retry button for dashboard, list, and magic-link request failures

### Offline states
- Read-only surfaces remain accessible using cached content.
- Mutation CTAs are disabled when connection is unavailable.
- Show reason text under disabled CTA:
  - `Internet connection is required for this action.`

---

## 8. Status Indicators and Visual Semantics

### Badge system
- **Success / Green**:
  - Paid
  - Registered
  - Active
  - Confirmed
- **Warning / Yellow or Amber**:
  - Unpaid
  - Pending Verification
  - Closing Soon
- **Danger / Red**:
  - Cancelled
  - Expired
  - Overdue
- **Neutral / Gray or Blue-gray**:
  - Draft
  - Informational
  - Archived

### List emphasis rules
- Unread notifications use a stronger title weight and indicator dot.
- Overdue invoices use stronger contrast than normal unpaid invoices.
- Registrations awaiting payment should show the next action prominently on the card.
- Registration-closed events should still be readable, but their CTA becomes secondary or disabled.

---

## 9. Accessibility and Usability Requirements

- Maintain strong contrast for badges, buttons, and banners.
- Ensure all icon-only controls have labels for accessibility services.
- Respect dynamic text scaling for titles, body copy, and metadata rows.
- Keep key CTAs reachable near the thumb zone on long screens through sticky bottom bars where needed.
- Avoid hiding critical status only by color; pair color with text labels.

---

## 10. Recommended Screen Build Order

1. Public Dashboard (Native)
2. Events & News (Native)
3. Event Detail (Native)
4. Hybrid Login (WebView)
5. Registrations List & Detail (Native)
6. Registration Management (Native CRUD)
7. Participant Management (Native CRUD)
8. Invoice Detail & Pay Now (Native/Midtrans)
9. Reusable WebView Bridge (Fallback Shell)
10. Profile & Notifications (Native)

This order matches the hybrid architecture and gives users a usable read experience early while preserving the portal's existing write flows.
