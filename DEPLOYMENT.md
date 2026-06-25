# PM Career OS Deployment Guide

This guide explains how to deploy PM Career OS to production using **Supabase** (Database & Auth) and **Netlify** (Static Hosting).

---

## 1. Supabase Backend Configuration

### Environment Variables
For both local development and production, ensure you have the following environment variables configured:

```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Database Tables
Ensure your Supabase project contains the following tables and schemas:

1. **`profiles`**
   - `id` (uuid, primary key, references auth.users)
   - `name` (text)
   - `target_role` (text)
   - `metadata` (jsonb)
   - `created_at` (timestamptz)

2. **`skills`**
   - `id` (uuid, primary key)
   - `user_id` (uuid, references auth.users)
   - `name` (text)
   - `progress` (int4)
   - `level` (text)
   - `category` (text)
   - `created_at` (timestamptz)

3. **`projects`**
   - `id` (uuid, primary key)
   - `user_id` (uuid, references auth.users)
   - `title` (text)
   - `description` (text)
   - `progress` (int4)
   - `status` (text)
   - `tags` (text[])
   - `created_at` (timestamptz)

4. **`weekly_reviews`**
   - `id` (uuid, primary key)
   - `user_id` (uuid, references auth.users)
   - `wins` (text)
   - `challenges` (text)
   - `improvements` (text)
   - `next_focus` (text)
   - `rating` (int4)
   - `created_at` (timestamptz)

5. **`portfolio_goals`**
   - `id` (uuid, primary key)
   - `user_id` (uuid, references auth.users)
   - `title` (text)
   - `description` (text)
   - `progress` (int4)
   - `deadline` (date)
   - `milestone` (text)
   - `completed` (boolean)
   - `created_at` (timestamptz)

### Row Level Security (RLS)
Enable RLS on all tables and create a policy allowing users to `ALL` operations where `user_id = auth.uid()` (or `id = auth.uid()` for profiles).

---

## 2. Netlify Deployment

1. **Build Settings**:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
   
2. **Environment Variables**:
   Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` to the Netlify environment settings.

3. **SPA Redirects**:
   A `netlify.toml` file is configured in the root directory to handle SPA client-side routing redirects:
   ```toml
   [[redirects]]
     from = "/*"
     to = "/index.html"
     status = 200
   ```
