# Avatar Review Workflow Design

## Goal

Allow users to upload an avatar from the personal center, keep the uploaded image hidden from public UI until an administrator approves it, and let hAdmin user management review and display user avatars.

## Scope

This feature spans the Express backend, Vue personal center, navigation/avatar display, and `admin/hadmin/users.html`.

Included:

- User uploads JPG, PNG, or WebP avatar images up to 2 MB.
- Backend stores uploaded images under `uploads/avatars/pending/`.
- Database stores both the active approved avatar and the pending avatar review state.
- Frontend shows pending/rejected/approved avatar status in personal center.
- Navigation and personal center identity use only approved `avatar_url`; pending avatars are previewed only in the user's own profile.
- hAdmin user management shows current avatar and pending avatar review status.
- Admins can approve or reject a pending avatar. Approval promotes it to `avatar_url`; rejection keeps the current avatar and records a reason.

Out of scope:

- Image cropping and editing.
- CDN/object-storage upload.
- Multiple pending avatar history.
- Automatic content moderation.

## Data Model

Use existing `users.avatar_url` as the approved avatar.

Add nullable columns:

- `pending_avatar_url VARCHAR(500)`
- `avatar_status VARCHAR(30) DEFAULT 'none'`
- `avatar_submitted_at DATETIME NULL`
- `avatar_reviewed_at DATETIME NULL`
- `avatar_reject_reason VARCHAR(500) DEFAULT NULL`

Allowed `avatar_status` values:

- `none`: no pending or reviewed avatar state.
- `pending`: user uploaded an avatar awaiting review.
- `approved`: latest upload was approved.
- `rejected`: latest upload was rejected.

## Backend API

`POST /api/user/avatar`

- Auth required.
- JSON body: `{ imageData, fileName? }`.
- `imageData` must be a data URL: `data:image/png;base64,...`, `data:image/jpeg;base64,...`, or `data:image/webp;base64,...`.
- Decode and validate size <= 2 MB.
- Store as `/uploads/avatars/pending/<userId>-<timestamp>.<ext>`.
- Update pending avatar fields and return the formatted user.

`PATCH /api/admin/users/:id/avatar`

- Admin auth and `user:update` permission required.
- Body: `{ action: "approve" | "reject", reason?: string }`.
- Approve: copy `pending_avatar_url` to `avatar_url`, set status `approved`, clear rejection reason, clear pending URL.
- Reject: set status `rejected`, keep `avatar_url`, clear pending URL, save optional reason.
- Both paths write audit logs.

`GET /api/auth/me` and `GET /api/admin/users`

- Include approved and review fields through `formatUser`.

## Frontend UX

Personal center:

- Show approved avatar if available; otherwise show initials.
- Add file picker and submit button.
- Show client-side file validation before upload.
- After upload, show "头像已提交，等待后台审核".
- If rejected, show "头像未通过审核" plus reason.
- If pending, show pending avatar preview but do not use it as the active avatar.

Navigation:

- Display approved avatar if available.
- Continue using initials/icon if no approved avatar.
- Keep the existing XP popover and personal center link behavior.

hAdmin users:

- Add an avatar column.
- Show approved avatar thumbnail or initials.
- If pending, show pending thumbnail and review controls.
- Review dialog shows pending image and buttons for approve/reject. Rejection asks for a reason.

## Testing

- Add backend unit coverage for avatar data URL validation and file metadata derivation.
- Add Playwright coverage that uploads an avatar in personal center and sees pending status.
- Add Playwright coverage or static checks for admin user avatar review rendering where practical.
- Run backend syntax/check, backend tests, frontend type-check, and targeted e2e.
