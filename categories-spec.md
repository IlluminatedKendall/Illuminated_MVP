# Feature Spec: User-Defined Custom Categories

## Objective
Users need the ability to create their own custom expense categories (e.g., "Software Subscriptions", "Travel", "Maintenance"). These categories must be tied to their specific `user_id` using RLS, and users must be able to assign these categories to their transactions.

## Phase 1: Database Migration (SQL)
*Agent Note: You cannot run SQL. Please output this exact SQL block in your response and instruct the user to run it in their Supabase SQL Editor.*

-- 1. Create the custom categories table
CREATE TABLE user_categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Turn on the RLS Firewall for categories
ALTER TABLE user_categories ENABLE ROW LEVEL SECURITY;

-- 3. Create security policies for categories
CREATE POLICY "Users can manage their own categories" 
ON user_categories FOR ALL 
USING (auth.uid() = user_id) 
WITH CHECK (auth.uid() = user_id);

-- 4. Link transactions to these new categories
ALTER TABLE transactions ADD COLUMN category_id UUID REFERENCES user_categories(id) ON DELETE SET NULL;

## Phase 2: Backend API Updates
1. **Create `/api/categories/route.ts`**: Build a GET and POST route using `@supabase/ssr` to allow users to fetch their custom categories and create new ones. Ensure it checks for an active session and returns a 401 if unauthorized.
2. **Update `/api/save-receipt/route.ts`**: Modify the existing receipt upload logic to accept an optional `category_id` from the frontend and insert it into the `transactions` table.

## Phase 3: UI Implementation
1. **Category Manager**: Create a small client component (e.g., `app/dashboard/CategoryManager.tsx`) where users can type a category name and save it to their account.
2. **Receipt Upload Update**: Update `app/dashboard/UploadReceipt.tsx` to fetch the user's categories and display them as a dropdown `<select>` menu so they can categorize a receipt before or during upload.
3. **Dashboard Display**: Update the main transaction list in the dashboard to display the assigned category name next to each receipt.

## Phase 4: Self-QA & Review
- Are all database calls using the secure `@supabase/ssr` client?
- Does the UI gracefully handle the state where a user has zero custom categories created yet?
- Are loading states and `try/catch` blocks implemented for category creation?
- Conclude your output with "SPEC IMPLEMENTATION COMPLETE" and remind the user to run the SQL in Phase 1.