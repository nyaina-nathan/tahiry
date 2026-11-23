# 001 — Animate the login/register mode switch

- **Status**: DONE (implemented in `70578d0`; browser feel-check still pending)
- **Commit**: 3f09443
- **Severity**: MEDIUM
- **Category**: Missed opportunity / Interruptibility
- **Estimated scope**: 3 files, ~45 lines

## Problem

The auth page switches between **Sign in / Register / Password reset** by
rendering a different set of fields instantly. The mode lives in
`features/auth/components/login-form.tsx` and is flipped here:

```tsx
// features/auth/components/login-form.tsx:51-55 — current
function switchMode(nextMode: AuthMode) {
  setMode(nextMode);
  setErrorMessage("");
  setIsPasswordResetSent(false);
}
```

The whole right-hand column in `features/auth/components/auth-shell.tsx:13-19`
then jumps:

```tsx
// features/auth/components/auth-shell.tsx:13-19 — current
<section className="relative flex w-full items-center justify-center px-5 py-10 sm:px-8 lg:w-[56%] lg:px-12">
  <div className="w-full max-w-[460px]">
    <AuthMobileBrand />
    <LoginForm />
    <AuthSecurityNote />
  </div>
</section>
```

Register mode adds two fields (username above email, currency below password),
so the column grows; the heading text and tab underline change too. Everything
snaps in the same frame, and the security note underneath teleports to its new
position. There is no transition at all.

**Why not animate the fields with CSS `height`/`max-height`?** The conditional
fields mount/unmount, so a height transition needs both endpoints measured, and
animating layout properties on the column is the janky approach. The View
Transitions API solves both the height morph and the content crossfade in one
call, without remounting the inputs (so a typed email survives the switch).

## Target

A same-document **view transition** scoped to the auth column. The root page
(hero, background, header) stays perfectly still; the column crossfades and
morphs its height over 220ms.

### 1. `features/auth/components/auth-shell.tsx` — name the column

```tsx
<div className="auth-panel w-full max-w-[460px]">
```

### 2. `features/auth/components/login-form.tsx` — trigger the transition

Add the import next to the existing React imports:

```tsx
import { flushSync } from "react-dom";
```

Replace `switchMode` with:

```tsx
function switchMode(nextMode: AuthMode) {
  if (nextMode === mode) {
    return;
  }

  const commit = () => {
    setMode(nextMode);
    setErrorMessage("");
    setIsPasswordResetSent(false);
  };

  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;

  if (!document.startViewTransition || prefersReducedMotion) {
    commit();
    return;
  }

  document.startViewTransition(() => {
    flushSync(commit);
  });
}
```

`flushSync` is required: React batches state updates, and the browser has to see
the new DOM before it starts the transition. Calling it inside the transition
callback is the supported pattern; this runs from a click handler, not from a
render or lifecycle.

### 3. `app/globals.css` — append the transition rules

```css
/* --------------------------------------------------------------------------
   Auth — login/register mode switch. A same-document view transition scoped to
   the auth column: the panel crossfades and morphs its height, nothing else on
   the page moves.
   -------------------------------------------------------------------------- */

.auth-panel {
  view-transition-name: auth-panel;
}

/* The rest of the page is identical before and after, so it must not crossfade. */
::view-transition-old(root),
::view-transition-new(root) {
  animation: none;
}

::view-transition-group(auth-panel) {
  animation-duration: 220ms;
  animation-timing-function: cubic-bezier(0.23, 1, 0.32, 1);
}

::view-transition-old(auth-panel) {
  animation: auth-panel-out 140ms cubic-bezier(0.23, 1, 0.32, 1) both;
}

::view-transition-new(auth-panel) {
  animation: auth-panel-in 200ms cubic-bezier(0.23, 1, 0.32, 1) both;
}

@keyframes auth-panel-out {
  to {
    opacity: 0;
    filter: blur(2px);
    transform: translateY(-4px);
  }
}

@keyframes auth-panel-in {
  from {
    opacity: 0;
    filter: blur(2px);
    transform: translateY(6px);
  }
}

@media (prefers-reduced-motion: reduce) {
  ::view-transition-group(auth-panel),
  ::view-transition-old(auth-panel),
  ::view-transition-new(auth-panel) {
    animation: none;
  }
}
```

The 220ms group animation is the height/position morph; the old snapshot leaves
in 140ms, the new one arrives in 200ms. Both stay inside the 150-250ms budget
for a content swap. `filter: blur(2px)` masks the crossfade's double exposure;
if it visibly stutters on low-end hardware, set it to `0` in both keyframes
before changing anything else.

## Repo conventions to follow

- Motion values come from the existing tokens in `app/globals.css:33-40`;
  `cubic-bezier(0.23, 1, 0.32, 1)` is already stored as `--ease-out-strong`.
  Do not add another curve.
- Complex, scoped motion CSS lives in `globals.css` (`.balance-*`, `.dash-*`,
  `.nav-label`), not as long arbitrary Tailwind strings.
- Reduced motion is always honoured with an explicit media query and a JS guard
  where motion is triggered from script — see `.balance-rise` and `.dash-card`
  in `app/globals.css`.
- `document.startViewTransition` is typed in the installed TypeScript DOM lib,
  so no casts or custom declarations are needed.

## Steps

1. Add the `auth-panel` class to the `max-w-[460px]` div in
   `features/auth/components/auth-shell.tsx:14`.
2. Add the `flushSync` import and replace `switchMode` in
   `features/auth/components/login-form.tsx`.
3. Append the CSS block to `app/globals.css`.
4. Nothing else: `LoginFormFields`, `AuthHeading`, `AuthModeTabs`, and the field
   components stay exactly as they are. No keyed remounts: the email/password
   inputs must keep their values when the mode changes.

## Boundaries

- Do NOT add a motion library or new dependencies.
- Do NOT animate `height`/`max-height` by hand, and do NOT key/remount the field
  list.
- Do NOT give any other element a `view-transition-name`.
- Do NOT change the auth page's layout, copy, or rounded input styles.
- Do NOT add a transition when the user clicks the already-active tab.
- If the code at these line numbers does not match the excerpts, STOP and report
  instead of improvising.

## Verification

- **Mechanical**:
  - `npx tsc --noEmit` → no output.
  - `npx eslint features/auth` → no errors (the pre-existing `<img>` warning in
    `auth-brand.tsx` is fine).
  - `npm run build` → "Compiled successfully".
- **Feel check** (open `/login` in a Chromium browser with DevTools → Animations,
  playback 10%):
  - Click **Register**: the heading, tabs, and fields crossfade (old out, new in)
    while the column grows smoothly. The security note below moves with the
    column instead of teleporting. The hero, page background, and header do not
    flicker or fade.
  - Click **Sign in**: the reverse happens; the column shrinks smoothly.
  - Type an email, click **Register**, and confirm the email is still there
    (no remount). Switch back: email and password are still populated.
  - Click the already-active tab: nothing animates.
  - Click **Register** then immediately **Sign in** while the first transition is
    still running: the second transition takes over; no stuck 50%-faded panel.
  - Keyboard: focus a tab, press Enter or Space — the transition runs and focus
    stays on the tab.
  - Toggle DevTools → Rendering → `prefers-reduced-motion: reduce`: mode switches
    instantly, with no crossfade.
  - In a browser without View Transitions, the switch is instant (fallback path).
- **Done when**: login ↔ register ↔ password reset all morph smoothly at 220ms,
  typed values survive the switch, and reduced motion switches instantly.
