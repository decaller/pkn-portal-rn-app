# Event Registration Status Report

This document outlines the lifecycle of an event registration, the meaning of each status, the automatic triggers they initiate, and the actions available to users at each stage.

## Core Registration Statuses

| Status | Meaning | Triggers | Booker/User Actions |
| :--- | :--- | :--- | :--- |
| **Draft** | Initial state. Selection of packages started but not finalized for payment. | Created when user starts registration. Also set if gateway payment fails. | Update packages, edit notes, manage participants, delete registration, proceed to payment. |
| **Pending Payment** | Payment initiated via gateway or proof submitted. | `markPaymentPendingFromGateway` called. | View invoice. *Note: Editing packages or removing participants is restricted during this phase.* |
| **Paid** | Payment successfully verified and confirmed. | `markPaidFromGateway` called. Triggers `allocateParticipantSlots()` and `PaymentApprovedNotification`. | **Critical:** Fill participant details (Name, Email, etc.) for the allocated slots. View invoice. |
| **Closed** | Event has concluded. Registration is archived. | `events:sync-past` command. Syncs event to User's `past_events` history. | Read-only. View past participation history in profile. |
| **Cancelled** | Registration aborted by user or admin. | Manual update to cancelled state. | No further actions available. |

---

## Payment Statuses (Synchronized)

Registration status often moves in tandem with payment status:

*   **Unpaid**: Initial state for **Draft**.
*   **Submitted**: Set during **Pending Payment**.
*   **Verified**: Set during **Paid**.
*   **Rejected**: Set if payment fails (moves back to **Draft** or **Cancelled**).

## System Actions & Triggers

### 1. Slot Allocation (`Paid`)
When a registration is marked as **Paid**, the system automatically executes `allocateParticipantSlots()`.
- It reads the `package_breakdown` (e.g., "3 Participants").
- It creates the corresponding number of empty participant records ("Pending...") linked to the registration.
- **Action Required:** Users must then navigate to their registration details to provide the actual participant information.

### 2. Notifications
- **Payment Approved:** Sent immediately to the booker when status moves to **Paid**.
- **Reminders:** `events:send-reminders` (Artisan) checks for pending registrations.

### 3. Past Event Synchronization (`Closed`)
The `events:sync-past` Artisan command:
1.  Identifies **Paid** registrations for events in the past.
2.  Appends the `event_id` to the `past_events` JSON array of the Booker.
3.  Appends the `event_id` to the `past_events` JSON array of all identified Participants.
4.  Updates Registration status to **Closed**.

## Action Policy Summary

| Action | Allowed Statuses | Authorized Role |
| :--- | :--- | :--- |
| **Update Packages** | Draft | Booker Only |
| **Manage Participants**| Draft (Unpaid) | Booker Only |
| **View Invoice** | Draft, Pending, Paid | Booker Only |
| **Fill Participant Info**| Paid | Booker & Participants |
| **Delete Registration** | Draft, Pending (if not locked) | Booker Only |

---
*Note: Main Admins (Super Admins) have full override permissions across all statuses.*
