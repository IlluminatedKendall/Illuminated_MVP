# Feature Spec: User Data Isolation & Row Level Security (RLS)

## Objective
Currently, the `transactions` table is global. We need to associate every transaction with the specific user who uploaded it and use PostgreSQL Row Level Security (RLS) to ensure users can only ever view, edit, or delete their own data.

## Phase 1: Database Migration (SQL)
*Agent Note: You cannot run SQL, so please output this exact SQL block in your response and instruct the human to run it in the Supabase SQL Editor.*

-- 1. Add user_id column to transactions, linked to Supabase Auth
ALTER TABLE transactions ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- 2. Turn on the RLS Firewall
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- 3. Create the security policies
CREATE POLICY "Users can insert their own transactions" 
ON transactions FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own transactions" 
ON transactions FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own transactions" 
ON transactions FOR DELETE USING (auth.uid() = user_id);

## Phase 2: Backend API Updates (`app/api/save-receipt/route.ts`)
1. Initialize the `@supabase/ssr` server client to read the user's secure cookie.
2. Fetch the active session (`supabase.auth.getUser()`).
3. If no user is logged in, immediately return a `401 Unauthorized` error.
4. When inserting the new row into the `transactions` table, include `user_id: user.id` in the payload.

## Phase 3: Dashboard Fetching (`app/dashboard/page.tsx`)
1. Ensure the dashboard is using the `@supabase/ssr` server client to fetch transactions. 
2. Because RLS is now enabled, Supabase will automatically filter the `.select()` query to only return rows matching the user's cookie. Ensure the data fetch handles empty states gracefully.

## Phase 4: Self-QA & Review
Once Phase 2 and 3 are coded, review your own work:
- Are there any missing imports for `@supabase/ssr` or `cookies` from `next/headers`?
- Is there a `try/catch` block handling the 401 Unauthorized state in the API route?
- Are TypeScript types strictly maintained (no `any`)?
- Conclude your output with "SPEC IMPLEMENTATION COMPLETE" and remind the user to run the SQL in Phase 1.