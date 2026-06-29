# Notator

A mobile-friendly PWA for quickly jotting down music ideas as aligned chord / beat / note grids — without manually spacing monospace text.

## What it does

- Tap beat chips to enter chords, beat counts, and notes
- Apply beat templates (`1 2 3 4`, `1–6`, eighths, sixteenths) so you rarely type numbers
- Live monospace preview with one-tap copy (paste into Notion if you want)
- Save ideas locally; optionally sync to Supabase when configured
- Install to your phone home screen as a PWA

## Quick start (local only)

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Without Supabase env vars, the app runs in local-only mode using browser storage.

## Cloud sync setup (Supabase)

1. Create a [Supabase](https://supabase.com) project
2. In the SQL editor, run [`supabase/schema.sql`](supabase/schema.sql)
3. In Authentication → Users, create your single account (email + password)
4. Copy project URL and anon key into `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

5. Restart the dev server and sign in at `/login`

## Deploy (Vercel)

1. Push this repo to GitHub
2. Import into [Vercel](https://vercel.com)
3. Add the same Supabase env vars in project settings
4. Deploy — the PWA works from your phone browser; use “Add to Home Screen”

## Scripts

- `npm run dev` — development server
- `npm run build` — production build
- `npm run start` — run production build
- `npm test` — unit tests for the text renderer

## Data model

Each idea is a **Piece** with title, meta (e.g. “Key of Bb, piano only”), and sections. Each section has optional label/notes and rows of cells. Each cell has:

- `beat` — count label (`1`, `+`, `e`, `6`, etc.)
- `note` — what you play (`Eb`, `Bb C`, …)
- `chord` — optional chord symbol starting at that beat

The renderer aligns all three rows automatically.

## Phone usage

1. Open the deployed URL in Safari (iOS) or Chrome (Android)
2. Sign in once
3. Add to Home Screen
4. Capture ideas offline — edits cache locally and sync when back online
