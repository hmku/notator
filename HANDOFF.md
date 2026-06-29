# Notator — handoff notes

Use this file to pick up where we left off.

---

## Original plan

### Goal

Make it fast to jot down music ideas on your phone. Today you use Notion and manually type beat numbers, chords, and notes so they line up in monospace — that’s slow. Notator stores each idea as a **structured grid** and auto-aligns the text for you. You tap beats, enter notes/chords, and get clean output (with one-tap **Copy** for pasting into Notion if you want).

### Decisions (confirmed)

- **Web app / PWA** — installable to phone home screen, also works on desktop
- **Cloud sync** via Supabase, **single private user** (one email/password account)
- **Structured beat-grid editor** as the core UX
- **Stack:** Next.js (App Router) + TypeScript + Tailwind + Supabase
- **Deploy target:** Vercel (optional — any host works; Vercel is just the easy default for Next.js)

### Data model

Each idea is a **Piece** with `title`, `meta` (e.g. “Key of Bb, piano only”), and **sections**.

Each **Section** has optional `label` (“block chords”), optional free-text `notes` (“maybe start high, chopin style”), and **rows**.

Each **Row** is a list of **cells**: `{ beat, note, chord? }`

- `beat` — count label (`1`, `+`, `e`, `6`, blank)
- `note` — what you play (`Eb`, `Bb C`, …)
- `chord` — optional symbol starting at that beat (`BbMaj7`, `G7b9b13`)

Rendering computes each column width as `max(beat.length, note.length)`, pads beat/note rows, then places chords on a line above at the correct cell offset.

```
Piece → Section → Row → Cell
                      ├─ beat
                      ├─ note
                      └─ chord (optional)
Row → render → aligned monospace text
```

### Editor UX (v1)

- Tappable **beat chips** per cell (beat on top, note below, chord badge if set)
- Tap chip → bottom sheet editor: chord, beat, note; **Next cell** to sweep across a bar
- **Beat templates:** `1 2 3 4`, `1–6`, `1 + 2 + 3 + 4 +`, `1 e + a …`
- `+ cell`, `+ row`, `+ section`; delete row/section buttons
- **Live preview** + **Copy** button at bottom

### Planned files

| Area | Files |
|------|-------|
| Core | `lib/types.ts`, `lib/render.ts`, `lib/templates.ts` |
| Backend client | `lib/supabaseClient.ts`, `lib/store.tsx`, `supabase/schema.sql` |
| Pages | `app/page.tsx`, `app/piece/[id]/page.tsx`, `app/login/page.tsx` |
| Components | `BeatGrid`, `BeatChip`, `CellEditor`, `SectionEditor`, `TemplateBar`, `RenderedPreview`, `PieceEditor` |
| PWA | `public/manifest.webmanifest`, `public/sw.js`, `public/icon.svg` |

### Backend (Supabase)

```sql
create table pieces (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id),
  title text not null default '',
  meta text not null default '',
  doc jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);
-- + RLS: users can only read/write their own rows
```

- Auth: Supabase email/password; login gates the app when env vars are set
- Sync: optimistic local updates, debounced upsert (~500ms), localStorage cache for offline

### Out of scope for v1

Audio/MIDI, staff notation, transposition, multi-user sharing, importing pasted text into the grid.

---

## What’s done

### App (built and working locally)

- [x] Next.js 15 + TypeScript + Tailwind project scaffolded in `/Users/hku/dev/notator`
- [x] Data model (`lib/types.ts`) and alignment renderer (`lib/render.ts`)
- [x] Unit tests for renderer (`lib/render.test.ts`) — all passing
- [x] Beat templates (`lib/templates.ts`)
- [x] Local storage + Supabase sync layer (`lib/storage.ts`, `lib/store.tsx`)
- [x] Supabase client + auth middleware (`lib/supabaseClient.ts`, `middleware.ts`, `app/login/page.tsx`)
- [x] SQL schema file ready (`supabase/schema.sql`)
- [x] Home screen: list ideas, search, new/delete (`app/page.tsx`)
- [x] Editor: sections, rows, beat grid, cell editor, preview + copy (`components/*`, `app/piece/[id]/page.tsx`)
- [x] PWA manifest, service worker, icon
- [x] `README.md` with setup instructions
- [x] Production build succeeds (`npm run build`)

### Code review + sync hardening (session 2)

- [x] Shared store via `PiecesProvider` (one instance app-wide; no refetch-on-navigation)
- [x] Offline edits now flush to cloud on reconnect (`dirtyIds` + `online` listener)
- [x] Remote load merges with local by `updatedAt` instead of overwriting (`mergeByUpdatedAt`) — no more clobbering unsynced edits
- [x] Rendered output trims trailing whitespace on every line
- [x] Replaced duplicate beat template with a real triplet template
- [x] Home "new idea" uses client navigation (`router.push`)
- [x] Added tests: `lib/storage.test.ts` (merge) + trailing-whitespace case (10 tests pass)
- [ ] **Known limitation:** sync is tombstone-less — a piece deleted on one device can be resurrected by another device that was offline at delete time. Needs a `deleted_at` soft-delete column to fix (deferred for single-user v1).

### Without Supabase env vars

The app runs in **local-only mode** — no login required, notes saved in browser `localStorage`.

### Dev server

```bash
cd /Users/hku/dev/notator
npm install   # already done once
npm run dev   # http://localhost:3000
```

---

## What’s NOT done yet

### Supabase cloud setup — DONE ✅

- [x] Logged in to Supabase CLI
- [x] Created hosted project **notator** (org `hku`, region `us-east-2`)
  - Project ref: `bsqimvsgbdjyisnzwwdh`
  - Dashboard: https://supabase.com/dashboard/project/bsqimvsgbdjyisnzwwdh
- [x] Applied schema via migration `supabase/migrations/20260629040808_init.sql` (`supabase db push`)
- [x] Created user account `harrisonku3@gmail.com` (email pre-confirmed via admin API), sign-in verified
- [x] Wrote `.env.local` with project URL + anon key (gitignored)

**DB password** was generated and saved to `/tmp/notator_dbpass.txt` (ephemeral — copy it to a password manager). To reset it later: Supabase dashboard → Project Settings → Database.

**⚠️ Weak password:** the account password is currently below Supabase's 6-char minimum (sign-in still works, but it's insecure). Strongly recommend changing it before deploying publicly — dashboard → Authentication → Users, or via the admin API.

### Deploy (optional)

- [x] Initialized git repo and committed all work locally
- [ ] **Create the GitHub repo** (agent couldn't — no `gh`/token). Then push:
  - Remote is already set to `git@github.com:hmku/notator.git` (SSH auth works as `hmku`)
  - Create an **empty** repo named `notator` at https://github.com/new (no README/license)
  - Then run: `git push -u origin main`
- [ ] Deploy to Vercel (or Netlify/Railway/etc.) — import the GitHub repo
- [ ] Add same Supabase env vars on host (from `.env.local`)
- [ ] Test PWA “Add to Home Screen” on phone
- [ ] Test offline edit → sync when back online

### Validation not yet done manually

- [ ] Recreate your four sample Notion notes in the grid and compare preview output
- [ ] End-to-end phone test with cloud sync

---

## Quick reference

| Command | Purpose |
|---------|---------|
| `npm run dev` | Local dev server |
| `npm test` | Renderer unit tests |
| `npm run build` | Production build |
| `supabase login` | Authenticate CLI (needed for cloud setup) |

| File | Purpose |
|------|---------|
| `HANDOFF.md` | This file |
| `README.md` | User-facing setup guide |
| `.env.example` | Env var template |
| `supabase/schema.sql` | Database schema to apply |

---

## Context from the conversation

- **Problem:** Notion scratch notes with aligned chords / beats / notes take too long to type on phone
- **Solution:** Beat-grid editor that handles alignment; optional cloud sync so ideas survive across devices
- **Vercel:** Not required — only needed if you want a public HTTPS URL for phone access away from home. Supabase is the backend; Vercel (or similar) is just where the Next.js app lives on the internet.
- **Next.js:** Serves the React UI, handles routing (`/`, `/piece/[id]`, `/login`), auth middleware, and production builds for deployment.
