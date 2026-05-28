# Profile Hub Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a first-version `/profile` personal center that aggregates account, XP, learning, notes, and value-report data for logged-in users.

**Architecture:** Add a single route-level Vue view, register it in the router loader map, and link to it from the existing logged-in navigation identity area. Keep all data access in existing stores/services: `useAuthStore`, `useCultivationStore`, `fetchValueReport`, and `NoteService`.

**Tech Stack:** Vue 3 Composition API, Pinia, Vue Router, TypeScript, Playwright e2e, Tailwind utility classes.

---

### Task 1: Regression Test

**Files:**
- Create: `vue-project/tests/e2e/profile.spec.ts`

- [ ] **Step 1: Write the failing test**

Create a Playwright test that seeds auth, XP, value report, inbox, and notes. It should visit `/profile` and assert that the page displays:

```ts
await expect(page.getByTestId('profile-page')).toBeVisible()
await expect(page.getByTestId('profile-display-name')).toContainText('Profile User')
await expect(page.getByTestId('profile-xp')).toContainText('640 XP')
await expect(page.getByTestId('profile-next-realm-gap')).toContainText('还差 860 XP')
await expect(page.getByTestId('value-report-card')).toBeVisible()
await expect(page.getByTestId('profile-learning-progress')).toContainText('12/81 章')
await expect(page.getByTestId('profile-notes-count')).toContainText('2')
await expect(page.getByTestId('profile-action-learning')).toBeVisible()
```

- [ ] **Step 2: Run test to verify it fails**

Run from `vue-project`:

```bash
npm exec playwright test tests/e2e/profile.spec.ts --grep "profile page aggregates account and learning state"
```

Expected: fail because `/profile` is not registered or `profile-page` does not exist.

### Task 2: Route and Navigation Entry

**Files:**
- Modify: `vue-project/src/router/index.ts`
- Modify: `vue-project/src/components/layout/Navigation.vue`

- [ ] **Step 1: Register route loader and route**

Add:

```ts
Profile: () => import('@/views/ProfileView.vue')
```

and route:

```ts
{ path: '/profile', name: 'Profile', component: routeLoaders.Profile, meta: { title: '个人中心', requiresAuth: true } }
```

- [ ] **Step 2: Link logged-in identity to `/profile`**

Keep the XP popover trigger on the round avatar button, and add a nearby text link or "个人中心" link that navigates to `{ name: 'Profile' }`. Mobile user identity should also include a direct profile link.

### Task 3: Profile View

**Files:**
- Create: `vue-project/src/views/ProfileView.vue`

- [ ] **Step 1: Build page state**

Use:

```ts
const authStore = useAuthStore()
const cultivationStore = useCultivationStore()
const { user, isLoggedIn, showPricingModal } = storeToRefs(authStore)
const { exp, currentRealm, nextRealm, progress } = storeToRefs(cultivationStore)
```

Load value report and notes on mount when logged in:

```ts
valueReport.value = await fetchValueReport(userId, { force })
notes.value = await NoteService.fetchUserNotes(userId)
```

- [ ] **Step 2: Render dashboard sections**

Include `data-testid` values used by the test:

```vue
<section data-testid="profile-page">
  <h1 data-testid="profile-display-name">{{ user?.display_name || '用户' }}</h1>
  <p data-testid="profile-xp">{{ formattedExp }} XP</p>
  <p data-testid="profile-next-realm-gap">还差 {{ formattedRemainingExp }} XP</p>
  <ValueReportCard :data="valueReport" :loading="valueReportLoading" @refresh="reloadValueReport" />
  <p data-testid="profile-learning-progress">{{ learnedText }}</p>
  <p data-testid="profile-notes-count">{{ notes.length }}</p>
  <router-link data-testid="profile-action-learning" :to="{ name: 'LearningPath' }">学习路径</router-link>
</section>
```

- [ ] **Step 3: Render unauthenticated state**

When `!isLoggedIn`, show a login call to action and call `authStore.openAuthModal('login')` from the button.

### Task 4: Verification

**Files:**
- Test: `vue-project/tests/e2e/profile.spec.ts`
- Test: `vue-project/src/views/ProfileView.vue`
- Test: `vue-project/src/router/index.ts`
- Test: `vue-project/src/components/layout/Navigation.vue`

- [ ] **Step 1: Run profile e2e**

```bash
npm exec playwright test tests/e2e/profile.spec.ts --grep "profile page aggregates account and learning state"
```

Expected: 1 passed.

- [ ] **Step 2: Run frontend type-check**

```bash
npm --prefix vue-project run type-check
```

Expected: `vue-tsc --noEmit` exits 0.

- [ ] **Step 3: Inspect diff**

```bash
git diff -- vue-project/src/views/ProfileView.vue vue-project/src/router/index.ts vue-project/src/components/layout/Navigation.vue vue-project/tests/e2e/profile.spec.ts
```

Expected: only profile hub changes plus the intentional navigation link.
