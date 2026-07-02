<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# KBite security conventions (mandatory)

Security is a hard requirement on this project. Every feature must follow these rules — do not defer them to "later".

## Secrets & keys
- `SUPABASE_SERVICE_ROLE_KEY`, `TOSS_SECRET_KEY`, `RESEND_API_KEY` are server-only. Never import them in client components, never prefix with `NEXT_PUBLIC_`, never log them.
- `.env.local` is gitignored — keep it that way. Only `.env.local.example` (empty values) is committed.

## Database (Supabase)
- Every table gets RLS enabled at creation time, with explicit policies. No table ships without RLS.
- Public reads only for `status = 'approved'` restaurants. Owners can only modify their own rows. Reviews require authenticated users.
- All server-side queries that bypass RLS (service role) live in server-only modules under `lib/` and validate input first.

## Input validation
- Every server action and API route validates its input with zod before touching the DB. Client-side validation (lib/validation/) is UX only — the server is the security boundary.
- File uploads: enforce MAX_UPLOAD_MB and MIME whitelist (lib/validation/register.ts) on the server too; randomize storage filenames; never trust client-provided file names or types.

## Partner auth & ownership
- Supabase Auth **email confirmation must stay ON**. Restaurant ownership (claim) is granted by matching the login email to `owner_email` — with confirmation off, anyone could sign up as someone else's email and take over their restaurant. Never disable it for "signup friction" reasons.
- `owner_email` is stored lowercased; claim comparison is exact-match on lowercase. Any query matching user-supplied strings with `like`/`ilike` must escape `%`, `_`, `\`.

## Payments (Phase 2)
- Card data never touches our code or DB — Toss Payments handles PCI DSS. Store only billing keys, payment keys, and amounts.
- Verify payment results server-side against the Toss API (never trust client callbacks alone). Amounts come from server-side plan definitions, never from the client.

## Misc
- Security headers are set in next.config.ts — extend (CSP) when Kakao Maps/Supabase domains are wired in, don't remove.
- Locale cookie is httpOnly + secure. New cookies follow the same defaults.
- No PII in logs, analytics events, or error messages. Analytics events carry IDs, not emails/phones.
- External links: `rel="noopener noreferrer"`. User-generated text is rendered as text, never `dangerouslySetInnerHTML`.
- Rate limiting required on public write endpoints (registration, reviews) when they go live — Vercel WAF or upstash ratelimit.
- Run `npm audit` when adding dependencies. Known accepted: postcss advisory GHSA-qx2v-qp2m-jg93 inside next (build-time only, no untrusted CSS input; fix arrives with next patch release).
