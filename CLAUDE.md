# CLAUDE.md

Instructions for anyone, human or AI, working in this repo. Written 05-11-2026 by reading the code, not from memory. Where something is unverified it says so.

MDetailing is a one-page marketing site for a mobile car-detailing business in Luxembourg. It has a single route, one API route for booking mail, and no database or CMS.

## Stack

| | |
|---|---|
| Framework | Next.js 15.5.7, App Router, `--turbopack` in dev |
| React | 19.1.0 |
| Language | TypeScript, `strict: true` |
| Styling | Tailwind CSS 4 through `@tailwindcss/postcss`, plus hand-written CSS in `src/app/globals.css` and `src/app/wash.css` |
| Animation | framer-motion 12, plus hand-written canvas and rAF code under `src/components/wash/` |
| 3D | three 0.179 with @react-three/fiber and drei |
| Mail | resend 4.8 |
| Tests | Vitest 3 with Testing Library and jsdom |

`@/*` resolves to `./src/*`. Use it; do not write deep relative imports.

## Commands

```bash
npm run dev      # next dev --turbopack
npm run build    # next build, passes with no environment variables set
npm test         # vitest run
npm run test:watch
npm run lint
```

## Layout

```
src/app/          routes, layout, global CSS, the send-email API route
src/components/   ui/ (Button, Card, Input, CardSwiper, TiltCard, CountUp, Beams)
                  wash/ (the canvas pressure washer and the page transition)
                  gallery/ (before-and-after, and the generated car SVGs)
                  Navigation/
src/sections/     one folder per page section
src/services/     ApiService, a static-method fetch wrapper
src/types/        shared types
src/utils/        cn()
src/translations/ en.json and fr.json
```

**Section convention.** Each folder in `src/sections/` holds `<Name>.tsx`, a `mapper.ts` that exports the data interface plus a `<Name>Mapper(data)` wrapper over `React.createElement`, and an `index.ts` re-exporting both. Follow it when adding a section.

**Class names** go through `cn()` in `src/utils/cn.ts`, which is `twMerge(clsx(...))`. It exists so a prop-passed class can override a default instead of fighting it.

## Things that are true and will surprise you

Each of these cost real debugging. Changing any of them reintroduces a specific bug.

1. **The canvas washer tracks coverage in a `Uint8Array` grid, not with `getImageData`.** Canvas pixel reads throw once a cross-origin image has been drawn. `src/components/wash/washer.ts`.

2. **That canvas sizes itself from `offsetWidth`, never `getBoundingClientRect()`.** The rect reports the transformed size, so a scaled or fractionally laid-out parent silently drifts the backing store.

3. **Every animation loop owns its own `requestAnimationFrame` handle.** Two loops sharing one handle means cancelling either kills both. That is what made the hero die when the trigger was released past 60% coverage.

4. **`requestAnimationFrame` stops completely in a backgrounded tab.** Anything that covers the screen needs a timer watchdog that finishes regardless, and a generation counter so frames queued by an abandoned run cannot paint over the page when the tab wakes. `src/components/wash/WashTransition.tsx`.

5. **An inline style written by framer-motion beats a Tailwind hover utility.** If a hover class appears to do nothing, check whether a motion component wrote an inline `transform` on the same element. Keep the entrance animation on a wrapper and the interaction on the child.

6. **`SWIPE_BREAKPOINT` in `CardSwiper.tsx` is duplicated as a media query in `src/app/wash.css`.** A test asserts they match. If you change one, change both.

7. **Generated ids use `useId`, never `Math.random()`.** A random id differs between the server render and hydration.

8. **`src/translations/en.json` and `fr.json` exist but nothing imports them.** `src/app/page.tsx` holds the copy inline as plain objects. There is no i18n wiring; treat the folder as unused until someone decides otherwise.

9. **`Team` and `Rewards` sections exist and are commented out** in `src/app/page.tsx`.

10. **`README.md` is the generic Next.js scaffold text** and does not describe this project. This file does.

## Environment

Nothing is required to build. All four are runtime only.

| Variable | Used by | Notes |
|---|---|---|
| `RESEND_API_KEY` | `src/app/api/send-email/route.ts` | Needed for the booking form to work in production |
| `NEXT_PUBLIC_RESEND_API_KEY` | same route, fallback only | Legacy name. Do not add new code reading it: `NEXT_PUBLIC_` means readable in the browser, which a mail key should never be |
| `NEXT_PUBLIC_API_URL` | `src/services/api.ts` | Defaults to `http://localhost:3000/api` |
| `NEXT_PUBLIC_BASE_URL` | sitemap and metadata | |

**Never construct an API client at module scope.** `next build` collects page data by importing route modules, so a client that throws on a missing key fails the whole build on any machine without it. Build it on first request instead.

## Tests

Vitest, jsdom by default. A test needing real Node globals puts `// @vitest-environment node` on its first line. Test files sit next to what they test as `<Name>.test.ts(x)`, and `vitest.setup.ts` wires Testing Library's matchers and cleanup.

Three conventions worth copying from the existing three files:

- **Mock the mail provider at the module boundary.** `src/app/api/send-email/route.test.ts` does this so no test can ever send real mail. The route mails a live customer address and the business inbox, so this is not optional.
- **Assert the contract, not the implementation.** The escaping tests assert that markup cannot reach the mail body, not that `esc` was called.
- **A test that cannot fail is worth nothing.** Before trusting a new test, reinstate the bug it targets, watch it go red, and restore the source.

## Rules

- **No comments in new code unless asked for in that session.** Put the explanation in the commit message. The comments already in `washer.ts`, `CardSwiper.tsx` and the mail route were explicitly asked for and record why a non-obvious choice was made; leave them.
- **Commit always, push never.** Pushing is Ruben's to trigger.
- **The default branch is `main`.** Ask git rather than assuming.
- **Never escape customer input by hand at the call site.** Use the route's `esc`, and escape every interpolated field, not just the obvious ones.
- **Do not add a dependency without saying why** in the same message.

## Known, unfixed

- `next build` warns that `metadataBase` is not set, so Open Graph and Twitter images resolve against `http://localhost:3000`.
- The derivation comment above `SWIPE_BREAKPOINT` comes to 968, while the constant and the CSS both say 976. The two code paths agree; only the stated arithmetic is off. Not investigated.
- `gh` on this machine is signed in as an account with read-only access to `Mopalio/mdetailing`, while the git remote pushes over an SSH alias on a different account. Pushing works; anything through the GitHub API does not.

## `design/`

`design/` holds the interactive design board the current look was chosen from. It is a review tool, not part of the site, and it is untracked. It is not built, linted or deployed.
