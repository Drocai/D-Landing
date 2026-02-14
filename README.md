# D-Landing - D RoC Music Hub

A landing page for D RoC's music, built with vanilla HTML/CSS/JavaScript and Supabase.

## 🚨 Current Deployment Issue

The site at https://d-roc.vercel.app/ is currently experiencing issues due to **invalid Supabase credentials**.

### Root Cause

1. **Invalid Supabase URL**: The hostname `skytldwvwkfulytqnuac.supabase.co` cannot be resolved
2. **Invalid API Key**: The current key appears to be a placeholder or truncated value

### How to Fix

#### Step 1: Get Valid Supabase Credentials

1. Go to your [Supabase Dashboard](https://app.supabase.com/)
2. Select your project (or create a new one)
3. Go to **Project Settings** → **API**
4. Copy the following values:
   - **Project URL** (e.g., `https://xxxxxxxxxxxxx.supabase.co`)
   - **anon/public key** (a long JWT token starting with `eyJ...`)

#### Step 2: Update Credentials

**Option A: Update in Code (for static deployment)**

Edit `index.html` around line 422-423 and replace:

```javascript
const SUPABASE_URL = 'YOUR_PROJECT_URL_HERE';
const SUPABASE_KEY = 'YOUR_ANON_KEY_HERE';
```

**Option B: Use Vercel Environment Variables (recommended)**

1. In your Vercel project settings, add environment variables:
   - `VITE_SUPABASE_URL` = your Supabase URL
   - `VITE_SUPABASE_ANON_KEY` = your Supabase anon key

2. Update `index.html` to use these variables (requires a build step)

#### Step 3: Set Up Database Tables

Your Supabase database needs these tables:

**Table: `subscribers`**
```sql
create table subscribers (
  id uuid default uuid_generate_v4() primary key,
  email text unique not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
```

**Table: `tracks`**
```sql
create table tracks (
  id serial primary key,
  title text,
  name text,
  status text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
```

**Table: `posts`**
```sql
create table posts (
  id uuid default uuid_generate_v4() primary key,
  image_url text,
  url text,
  caption text,
  visibility text default 'public',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
```

#### Step 4: Enable Row Level Security (RLS)

Enable RLS on all tables and create appropriate policies:

```sql
-- Allow public read access to tracks and posts
alter table tracks enable row level security;
alter table posts enable row level security;
alter table subscribers enable row level security;

create policy "Allow public read access on tracks"
  on tracks for select
  using (true);

create policy "Allow public read access on posts"
  on posts for select
  using (visibility = 'public');

create policy "Allow public insert on subscribers"
  on subscribers for insert
  with check (true);
```


## 🐂 DUMB BULL prototype

A React-based game prototype scaffold is included at `src/dumb-bull/App.jsx` with setup notes in `src/dumb-bull/README.md`.

## 📁 Project Structure

```
D-Landing/
├── index.html          # Main landing page
├── package.json        # Node dependencies
├── vercel.json         # Vercel configuration
└── src/
    └── lib/
        └── supabase.ts # Supabase client (not currently used)
```

## 🚀 Local Development

1. Install dependencies:
   ```bash
   npm install
   ```

2. Update Supabase credentials in `index.html`

3. Serve the site locally:
   ```bash
   python3 -m http.server 8080
   ```
   Or use any other static file server.

4. Open http://localhost:8080 in your browser

## 🔧 Deployment

The site is configured for Vercel deployment:

1. Push your changes to GitHub
2. Vercel will automatically deploy
3. The `vercel.json` ensures all routes serve `index.html`

## ⚠️ Important Notes

- **Never commit your service_role key** - only use the anon/public key in the frontend
- The current implementation includes error handling for missing/invalid Supabase credentials
- The site will gracefully degrade if Supabase is unavailable
- Always test locally before deploying

## 🎵 Features

- Latest music release showcase with streaming links
- Email subscription to mailing list
- Track roadmap display
- Photo gallery
- Purple Chalk game integration
- Fully responsive design

## 🆘 Support

If you continue to have issues:

1. Check the browser console for error messages
2. Verify your Supabase project is active
3. Ensure RLS policies are correctly configured
4. Check Vercel deployment logs
