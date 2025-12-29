# Cyvara App (Next.js + Supabase) — MVP

This is a minimal but real SaaS dashboard:
- Email+password login (Supabase Auth)
- Per-account data isolation (Row Level Security)
- Dashboard: Leads table
- Lead detail: edit status/notes + message history

## Setup
1) Create a Supabase project.
2) Supabase → SQL Editor → run `supabase/schema.sql`.
3) Copy `.env.example` → `.env.local` and fill in your keys.
4) Install + run:
```bash
npm install
npm run dev
```
Open http://localhost:3000

## Deploy
Deploy to Vercel, add the same env vars, then connect `app.cyvara.co` via DNS.
