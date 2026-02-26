# Project Memory: Illuminated Payments MVP

## Architectural Decisions

### Authentication & Supabase
- **Client split**: Use `@supabase/ssr` with two clients:
  - `lib/supabase/client.ts` — `createBrowserClient` for client components (login, signup, TransactionList, LogoutButton)
  - `lib/supabase/server.ts` — `createServerClient` with `cookies()` from `next/headers` for server components and API routes
- **Middleware**: Protects `/dashboard` and sub-routes; redirects unauthenticated users to `/login`. Authenticated users on `/login` or `/signup` are redirected to `/dashboard`.
- **Cookie preservation on redirects**: When middleware returns `NextResponse.redirect()`, it must copy cookies from the main response to the redirect response so Supabase session updates are not lost. Use a `copyResponseCookies()` helper.
- **Fail-secure**: If `NEXT_PUBLIC_SUPABASE_URL` or `NEXT_PUBLIC_SUPABASE_ANON_KEY` are missing, still redirect `/dashboard` to `/login`.

### Row Level Security (RLS)
- **Transactions**: `user_id` column, RLS policies for INSERT/SELECT/DELETE where `auth.uid() = user_id`
- **user_categories**: Own table with `user_id`; RLS policy for ALL using `auth.uid() = user_id`
- **transactions.category_id**: Optional FK to `user_categories(id)` with `ON DELETE SET NULL`
- **API routes**: Use the server client (cookies) and include `user_id` in inserts; RLS filters selects by session

### Categories
- **GET/POST** `/api/categories` — Fetches and creates user categories; requires session; returns 401 when unauthorized
- **save-receipt**: Accepts optional `category_id` in payload and writes it to the transaction row

---

## Bugs Encountered & Fixes

1. **Middleware cookie loss on redirect** — Returning `NextResponse.redirect()` discarded cookies set by Supabase in `setAll`. Fix: Copy cookies from the main `response` onto the redirect response before returning.
2. **Missing env vars allowed dashboard access** — With env vars missing, middleware returned `next()` for all routes. Fix: Check env before creating client; when missing and path is `/dashboard`, redirect to `/login`.
3. **TransactionList delete failed with RLS** — Deletes used `lib/supabase` (plain client without cookies). Fix: Use `createClient` from `lib/supabase/client` so deletes run with the user's session.
4. **Login/signup stuck loading on network error** — No `try/catch` around `signInWithPassword`/`signUp`. Fix: Wrap in `try/catch/finally`; `setLoading(false)` in `finally`; show generic error message in `catch`.

---

## Styling Conventions

### Pre-Auth (Home, Login, Signup)
- **Background**: `bg-slate-950` with radial gradient `rgba(88, 28, 135, 0.3)` overlay
- **Container**: Glassmorphism — `bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl`
- **Accents**: `text-violet-400`, `text-white` for headings, `text-slate-400` for body
- **Lightbulb**: Icon above main headline; `text-violet-400 drop-shadow-[0_0_8px_rgba(139,92,246,0.8)]`
- **Primary buttons**: `bg-violet-600` with glow `shadow-[0_0_20px_rgba(139,92,246,0.4)]`; hover: `-translate-y-0.5`

### Dashboard (Post-Auth)
- **Background**: `bg-slate-50`
- **Cards**: `.section-card` — `rounded-2xl border border-slate-200 bg-white p-6 shadow-sm`
- **Typography**: `text-slate-900` for headings, `text-slate-700` for body, `text-slate-400` for labels
- **Primary buttons**: `bg-violet-600`, `shadow-[0_4px_14px_rgba(124,58,237,0.4)]`, `hover:-translate-y-0.5`
- **Focus rings**: `ring-violet-400` or `focus:ring-violet-400`

### Loading States
- **Dashboard loading.tsx**: Lightbulb icon with `animate-pulse text-violet-600`
- **UploadReceipt** (scan/save): Lightbulb with `animate-pulse text-violet-200` beside button text

### Brand
- **neonPurple**: `#7C3AED` (Tailwind `violet-600`)
- **Prefer slate over zinc** for dashboard neutrals for readability on light backgrounds
