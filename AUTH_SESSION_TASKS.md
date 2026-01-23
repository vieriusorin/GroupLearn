## Auth Sessions & Proxy Hardening Tasks

- [x] **Define plan and create task file**
  - [x] Capture high-level goals (DB-backed sessions, optimistic proxy, activity-based refresh)
  - [x] List concrete implementation steps and keep this file updated

- [x] **Strengthen Better Auth session configuration**
  - [x] Configure `session.expiresIn` for shorter-lived sessions (e.g. 12–24h)
  - [x] Configure `session.updateAge` for sliding sessions on user activity
  - [ ] Optionally enable `session.freshAge` for high‑risk actions
  - [x] Enable `session.cookieCache` as a short-lived cache over the DB (not stateless-only)

- [x] **Refine proxy-based auth protection**
  - [x] Define clear protected route prefixes (e.g. `/dashboard`, `/lesson`, `/review`, `/admin`)
  - [x] Exclude public and auth/API routes from protection
  - [x] Keep role-based admin gating in `proxy.ts`
  - [x] Add an explicit `config.matcher` for the proxy

- [x] **Optimize proxy behaviour**
  - [x] Optionally add a cheap cookie check before calling `auth.api.getSession`
  - [x] Ensure redirects include `callbackUrl` where appropriate
  - [x] Preserve `x-user-*` header injection for downstream handlers

- [ ] **Config & quality checks**
  - [ ] Ensure `BETTER_AUTH_URL` and `useSecureCookies` behave correctly across envs
  - [ ] Consider adding `trustedOrigins` to Better Auth config
  - [x] Run lints on updated files and fix any introduced issues


