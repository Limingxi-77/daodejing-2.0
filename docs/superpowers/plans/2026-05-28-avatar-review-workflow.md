# Avatar Review Workflow Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build user avatar upload with admin approval before the avatar appears publicly.

**Architecture:** Add a small backend avatar utility for data URL validation, extend `users` review fields, add user/admin avatar endpoints, create a Vue avatar service, update profile/navigation avatar UI, and extend hAdmin user management. Avoid upload middleware by sending base64 JSON to match current dependencies.

**Tech Stack:** Express, Node `fs/promises`, MySQL, Vue 3 Composition API, Pinia, Playwright, hAdmin static HTML/JavaScript.

---

### Task 1: Backend Avatar Utilities

**Files:**
- Create: `backend/lib/avatar-utils.js`
- Create: `backend/tests/avatar-utils.test.js`

- [ ] **Step 1: Write utility tests**

Cover valid PNG/JPEG/WebP data URLs, invalid MIME, invalid base64, and oversized payload detection.

- [ ] **Step 2: Run backend unit tests and confirm red**

Run:

```bash
npm --prefix backend test -- avatar-utils.test.js
```

Expected: fail because `backend/lib/avatar-utils.js` does not exist.

- [ ] **Step 3: Implement utility**

Export `parseAvatarDataUrl(imageData, maxBytes)` returning `{ buffer, mime, ext, size }`.

### Task 2: Backend Fields and APIs

**Files:**
- Modify: `backend/app.js`

- [ ] **Step 1: Extend user formatting and schema**

Add avatar review columns to `CREATE TABLE IF NOT EXISTS users`, add defensive `ALTER TABLE ... ADD COLUMN IF NOT EXISTS` calls, and return fields from `formatUser`.

- [ ] **Step 2: Add user upload route**

Implement `POST /api/user/avatar` using `parseAvatarDataUrl`, saving files to `uploads/avatars/pending`, updating pending fields, and returning `{ success: true, user }`.

- [ ] **Step 3: Add admin review route**

Implement `PATCH /api/admin/users/:id/avatar` with `approve` and `reject`.

- [ ] **Step 4: Include avatar fields in admin user list select**

Add `avatar_url`, `pending_avatar_url`, `avatar_status`, `avatar_submitted_at`, `avatar_reviewed_at`, and `avatar_reject_reason`.

### Task 3: Frontend Service and Stores

**Files:**
- Modify: `vue-project/src/stores/auth.ts`
- Create: `vue-project/src/services/avatarService.ts`

- [ ] **Step 1: Extend `User` type and mapper**

Add approved and review avatar fields.

- [ ] **Step 2: Add avatar upload service**

Read image file to data URL and post it to `/user/avatar`.

### Task 4: Profile and Navigation UI

**Files:**
- Modify: `vue-project/src/views/ProfileView.vue`
- Modify: `vue-project/src/components/layout/Navigation.vue`

- [ ] **Step 1: Add profile upload controls**

Show active avatar, file picker, preview, submit button, and status alerts.

- [ ] **Step 2: Sync auth user after upload**

When upload succeeds, update the auth store user so pending status appears immediately.

- [ ] **Step 3: Show approved avatar in navigation**

Use `user.avatar_url` for navigation avatar images; otherwise fall back to icon/initial.

### Task 5: hAdmin User Review UI

**Files:**
- Modify: `admin/hadmin/users.html`

- [ ] **Step 1: Add avatar column**

Render current avatar thumbnail and pending status.

- [ ] **Step 2: Add review actions**

For pending avatars, show a review button that opens an image preview dialog with approve/reject actions.

- [ ] **Step 3: Call admin review API**

Call `PATCH /api/admin/users/:id/avatar` and reload the table on success.

### Task 6: Verification

**Files:**
- Test: `backend/tests/avatar-utils.test.js`
- Test: `vue-project/tests/e2e/profile-avatar.spec.ts`

- [ ] **Step 1: Run backend tests**

```bash
npm --prefix backend test
```

- [ ] **Step 2: Run backend check**

```bash
npm --prefix backend run check
```

- [ ] **Step 3: Run frontend type-check**

```bash
npm --prefix vue-project run type-check
```

- [ ] **Step 4: Run targeted avatar e2e**

```bash
npm exec playwright test tests/e2e/profile-avatar.spec.ts --grep "profile avatar upload enters pending review"
```
