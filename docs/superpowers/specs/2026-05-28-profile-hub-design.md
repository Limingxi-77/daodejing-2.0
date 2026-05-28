# Profile Hub Design

## Goal

Add a complete first-version personal center for logged-in users, focused on account overview and learning state aggregation. Avatar upload and avatar editing are intentionally left for the next feature.

## Scope

The first version adds a `/profile` route and a visible entry from the logged-in avatar area. The page aggregates existing frontend and backend-backed data:

- Basic account identity: display name, username, email, member tier, account creation date.
- Cultivation status: current XP, current realm, next realm, remaining XP, and progress bar.
- Value report: reuse `ValueReportCard` with refresh support.
- Learning snapshot: completed Dao chapters and total progress from `ValueReport.progress`.
- Notes snapshot: local/remote note count and recent note metadata using `NoteService.fetchUserNotes`.
- Quick actions: go to daily sign, learning path, AI interpretation, inbox, pricing/member upgrade, and notes-related learning page.

Out of scope:

- Avatar upload, avatar cropping, avatar persistence, or profile photo replacement.
- Editing display name/email/password.
- Notification preferences, security settings, and data export/import workflows.

## UX

Clicking the logged-in avatar or user identity in navigation opens the profile page. The existing small XP popover remains useful for fast XP checks, but the page becomes the full account destination.

The profile page uses a dashboard layout:

- A top identity band with avatar initials, display name, email, and member badge.
- A cultivation panel with XP, realm progress, and next-realm gap.
- A value report panel using the existing `ValueReportCard`.
- Compact panels for learning progress, notes, and quick actions.
- If the user is not logged in, the page prompts login instead of showing empty data.

## Architecture

Create `vue-project/src/views/ProfileView.vue` and register it in `vue-project/src/router/index.ts`. Keep the implementation frontend-only by reusing:

- `useAuthStore` for account and login modal state.
- `useCultivationStore` for XP and realm progress.
- `fetchValueReport` / `clearValueReportCache` for value data.
- `NoteService.fetchUserNotes` for note count and recent notes.
- Existing router links for quick actions.

Move only page-local loading/error state into `ProfileView.vue`. Do not add backend APIs for this version.

## Error Handling

If value report loading fails, show the profile with a lightweight "暂无数据" state through `ValueReportCard`. If note loading fails, fall back to cached local notes through `NoteService`. If the user is unauthenticated, show a login call to action and open the existing auth modal.

## Testing

Add Playwright coverage that seeds a logged-in user, XP, value report API response, inbox response, and note API response, then verifies `/profile` renders identity, XP, next realm gap, value report, notes, and quick actions. Run the profile e2e test and frontend type-check.
