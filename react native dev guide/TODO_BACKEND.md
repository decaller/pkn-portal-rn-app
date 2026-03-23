# Backend TODOs for Phase 2 & 3 (Native App)

This document outlines the API endpoints and features that need to be implemented or verified on the Laravel backend to support Phase 2 (Native Login & Identity) and Phase 3 (Native Registration) of the mobile app.

## Phase 2: Native Login & Identity
*The mobile app is now using a fully native login flow instead of a WebView bridge.*

- [ ] **Sanctum Authentication**
  - Ensure Laravel Sanctum is installed and configured for mobile token authentication.
  - Implement `POST /api/v1/auth/login` returning a plaintext token and user profile.
  - Implement `POST /api/v1/auth/logout` to revoke the token.
  - Implement `GET /api/v1/user` to get the authenticated user's details.

- [ ] **Profile & User Management**
  - Implement `GET /api/v1/user/profile` to fetch profile summary and linked organizations.
  - Implement `PUT /api/v1/user/profile` for lightweight profile edits.

- [ ] **Documents API (Authenticated)**
  - Implement `GET /api/v1/documents` with pagination, search, and category filtering.
  - Implement `GET /api/v1/documents/{id}` to fetch document details and secure file URLs.

## Phase 3: Native Registration & Participant Management
*Registration flows will be handled natively via API rather than redirecting to a web view.*

- [ ] **Registrations API**
  - Implement `POST /api/v1/registrations` to create a new registration (event_id, package_id, participants).
  - Implement `PUT /api/v1/registrations/{id}` to update registration details.
  - Implement `DELETE /api/v1/registrations/{id}` to cancel draft/unpaid registrations.

- [ ] **Participants CRUD**
  - Implement `GET /api/v1/registrations/{id}/participants` to list participants.
  - Implement `POST /api/v1/registrations/{id}/participants` to add a new participant.
  - Implement `PUT /api/v1/participants/{participant_id}` to update a participant.
  - Implement `DELETE /api/v1/participants/{participant_id}` to remove a participant.

- [ ] **Organizations API**
  - Implement `GET /api/v1/organizations` to list organizations the user belongs to.

## Note
Please ensure all API endpoints return JSON responses (e.g., using Laravel API Resources), handle validation errors correctly, and return absolute URLs for images and files.
