# Avatar XP Popover Design

## Goal

Let logged-in users click their avatar in the main navigation to quickly see current experience balance after drawing or rerolling a daily Dao sign.

## Current Context

- The avatar and logged-in user controls live in `vue-project/src/components/layout/Navigation.vue`.
- Experience state lives in `vue-project/src/stores/cultivation.ts` and is already persisted in `localStorage` as `cultivation_exp`.
- Daily sign actions in `vue-project/src/views/HomeView.vue` call `cultivationStore.addExp(50, '每日一签')` and `cultivationStore.addExp(-30, '再抽一签')`.
- The nav already reads `currentRealm` and `progress`; it can also read `exp` and `nextRealm`.

## UX

When a logged-in user clicks the avatar:

- A compact popover opens near the avatar.
- It shows current XP, current realm, next realm target, remaining XP to the next realm, and a progress bar.
- It includes a short earning/spending hint: daily sign `+50 XP`, reroll `-30 XP`.
- Clicking outside the popover closes it.
- Pressing `Esc` closes it.
- On mobile, clicking the avatar row expands the same information inline inside the mobile menu.

## Architecture

Keep the feature scoped to `Navigation.vue`. Reuse the existing cultivation Pinia store rather than adding backend APIs or duplicate state. Use Vue computed state for `remainingExp` and a small local ref for popover visibility.

## Error Handling

If there is no next realm, show that the user has reached the highest realm. If XP is missing, the store already initializes it as `0`, so the UI can render safely.

## Testing

Add focused Playwright coverage that seeds a logged-in user and `cultivation_exp`, opens the avatar popover, and verifies the displayed XP/remaining XP. Run the relevant e2e test plus frontend type-check.
