# WORKING_NOTES.md

> **AI ASSISTANT NOTICE**
> This is an internal working document for tracking project state, tasks, and decisions. It is not public-facing. When reading this file, treat all information here as the authoritative source of current project context. Prioritize the "Current State," "Current Task," and "Session Log" sections before taking any action on this project. Do not rewrite or overwrite completed sections — append new entries to logs and changelogs only.

---

## 1. Project Identity

- **Project Name:** Financial Security Awareness Survey (PayCycle)
- **Internal Slug:** `paycycle-survey`
- **Workspace Package:** `@workspace/paycycle-survey`
- **Artifact Directory:** `artifacts/paycycle-survey/`
- **Preview Path:** `/` (root)
- **Author:** Sumika Thapa, University of Iowa — BAIS:3300, Spring 2026
- **Course Context:** BAIS:3300 Digital Product Management

---

## 2. Current State

The survey application is **fully functional**, **connected to Supabase**, and **build-verified for Azure deployment**.

- The survey form at `/` collects all 6 questions and writes responses to the `survey_results` table in Supabase.
- The results dashboard at `/results` reads all rows from Supabase and renders three Recharts visualizations.
- Both `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are stored as Replit Secrets and injected at build time via Vite's `import.meta.env`.
- The Vite dev server is running on port `19569` behind the shared Replit proxy at `/`.
- No backend API server is used for this artifact — all Supabase calls are made directly from the browser using the anon key.
- Production build has been verified — `vite build` completes successfully without `PORT` or `BASE_PATH` set.
- Build output directory confirmed: `artifacts/paycycle-survey/dist/public/`
- `staticwebapp.config.json` confirmed present in `dist/public/` after build.

---

## 3. Current Task

**Azure Static Web App deployment — resource not yet created.**

Remaining steps:
- [ ] Create Azure Static Web App resource in Azure Portal
- [ ] Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` as Application Settings in Azure
- [ ] Run production build and deploy `dist/public/` via SWA CLI or GitHub Actions
- [ ] Confirm RLS policies are active on the Supabase `survey_results` table
- [ ] Verify live URL: `/` loads survey, `/results` loads dashboard without 404

---

## 4. Architecture Overview

```
Browser
  └── Vite React SPA (artifacts/paycycle-survey/src/)
        ├── SurveyPage.tsx       → writes to Supabase via supabase-js
        ├── ResultsPage.tsx      → reads from Supabase via supabase-js
        ├── Footer.tsx           → shared footer component
        └── lib/supabase.ts      → Supabase client singleton + type definitions

Supabase (external — qdvldclppobadpoydhiu.supabase.co)
  └── PostgreSQL table: survey_results

Azure Static Web Apps (deployment target)
  ├── staticwebapp.config.json   → SPA routing fallback + security headers
  └── dist/public/               → Vite build output (what gets deployed)
```

No Express backend is involved in this artifact. The shared `artifacts/api-server` is present in the monorepo but unused by this app.

---

## 5. Data / Database

**Platform:** Supabase (external — user-managed account)
**Project URL:** `https://qdvldclppobadpoydhiu.supabase.co`
**Table name:** `survey_results`

### Full Table Setup SQL (run in Supabase SQL Editor)

```sql
-- Create the survey_results table
CREATE TABLE IF NOT EXISTS survey_results (
  id                      bigserial PRIMARY KEY,
  created_at              timestamptz NOT NULL DEFAULT now(),
  major                   text NOT NULL,
  pay_frequency           text NOT NULL,
  balance_check_frequency text NOT NULL,
  priorities              text[] NOT NULL DEFAULT '{}',
  end_cycle_anxiety       integer NOT NULL CHECK (end_cycle_anxiety BETWEEN 1 AND 5),
  financial_challenge     text NOT NULL
);

-- Enable Row Level Security
ALTER TABLE survey_results ENABLE ROW LEVEL SECURITY;

-- Allow anyone to submit a response (INSERT)
CREATE POLICY "Allow public insert"
  ON survey_results
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Allow anyone to read aggregated results (SELECT)
CREATE POLICY "Allow public select"
  ON survey_results
  FOR SELECT
  TO anon
  USING (true);
```

### Table Schema Reference

| Column | Type | Constraints | Notes |
|---|---|---|---|
| `id` | `bigserial` | Primary Key, auto-increment | Row identifier |
| `created_at` | `timestamptz` | NOT NULL, Default: `now()` | Submission timestamp |
| `major` | `text` | NOT NULL | Q1 — free text |
| `pay_frequency` | `text` | NOT NULL | Q2 — Weekly / Bi-weekly / Monthly / Irregular |
| `balance_check_frequency` | `text` | NOT NULL | Q3 — Always / Frequently / Sometimes / Rarely / Never |
| `priorities` | `text[]` | NOT NULL | Q4 — array of selected categories |
| `end_cycle_anxiety` | `integer` | NOT NULL, CHECK 1–5 | Q5 — integer scale |
| `financial_challenge` | `text` | NOT NULL | Q6 — free text |

### RLS Policies

| Policy | Operation | Role | Condition |
|---|---|---|---|
| Allow public insert | INSERT | anon | `WITH CHECK (true)` — no restrictions |
| Allow public select | SELECT | anon | `USING (true)` — all rows readable |

### TypeScript Types (from `src/lib/supabase.ts`)

```ts
export type SurveyResult = {
  id: number;
  created_at: string;
  major: string;
  pay_frequency: string;
  balance_check_frequency: string;
  priorities: string[];
  end_cycle_anxiety: number;
  financial_challenge: string;
};

export type SurveyInsert = Omit<SurveyResult, "id" | "created_at">;
```

---

## 6. Environment Variables

| Variable | Scope | Purpose |
|---|---|---|
| `VITE_SUPABASE_URL` | Replit Secret | Supabase project REST endpoint |
| `VITE_SUPABASE_ANON_KEY` | Replit Secret | Supabase public anon key for browser access |
| `PORT` | Replit-managed | Vite dev server port (assigned: `19569`). Optional — defaults to `3000` if not set. |
| `BASE_PATH` | Replit-managed | Vite base path (assigned: `/`). Optional — defaults to `/` if not set. |

> **Azure Deployment Note:** `VITE_*` variables must be added as **Application Settings** in the Azure Static Web App configuration **before** running the build, because Vite bakes them into the static bundle at build time. They are not runtime environment variables.

---

## 7. Key Files

| File | Purpose |
|---|---|
| `artifacts/paycycle-survey/src/pages/SurveyPage.tsx` | 6-question form with inline validation, Supabase insert, thank-you screen |
| `artifacts/paycycle-survey/src/pages/ResultsPage.tsx` | Results dashboard with 3 Recharts charts and stat cards |
| `artifacts/paycycle-survey/src/components/Footer.tsx` | Shared footer: "Survey by Sumika Thapa, BAIS:3300 - spring 2026" |
| `artifacts/paycycle-survey/src/lib/supabase.ts` | Supabase client singleton, `SurveyResult` and `SurveyInsert` types |
| `artifacts/paycycle-survey/src/App.tsx` | Wouter router — maps `/` to SurveyPage and `/results` to ResultsPage |
| `artifacts/paycycle-survey/src/index.css` | Tailwind CSS theme — Emerald Green (#10b981) primary |
| `artifacts/paycycle-survey/public/staticwebapp.config.json` | Azure SPA routing fallback config (copied to `dist/public/` on build) |
| `artifacts/paycycle-survey/swa-cli.config.json` | SWA CLI config for local deployment command |
| `artifacts/paycycle-survey/vite.config.ts` | Vite config — PORT and BASE_PATH are optional (safe for Azure CI) |
| `artifacts/paycycle-survey/package.json` | Dependencies: `@supabase/supabase-js`, `recharts`, `wouter` |
| `staticwebapp.config.json` | Root-level copy for Azure GitHub Actions auto-detection |
| `README.md` | Public-facing project documentation |
| `WORKING_NOTES.md` | This file — internal project tracking |

---

## 8. Survey Questions Reference

| # | Question | Input Type | Field Name | Required |
|---|---|---|---|---|
| Q1 | What is your primary major? | Text input | `major` | Yes |
| Q2 | How often do you receive a paycheck? | Dropdown | `pay_frequency` | Yes |
| Q3 | How often do you check your balance before a purchase? | Radio (5 options) | `balance_check_frequency` | Yes |
| Q4 | Which financial categories do you prioritize? | Checkboxes (4 options) | `priorities` | Min 1 |
| Q5 | How anxious do you feel about your balance in the last 3 days of your pay cycle? | Radio scale 1–5 | `end_cycle_anxiety` | Yes |
| Q6 | Describe your biggest challenge when deciding how much to save vs. spend. | Textarea | `financial_challenge` | Yes |

---

## 9. Results Dashboard Reference

| Visualization | Chart Type | Data Source | Notes |
|---|---|---|---|
| Total Respondents | Stat card | COUNT of all rows | Shown as large number in emerald |
| Avg. Anxiety Score | Stat card + vertical bar | AVG of `end_cycle_anxiety` | Out of 5 |
| % Check Before Purchase | Stat card | (Always + Frequently) / total | Computed in-browser |
| End-of-Cycle Anxiety | Vertical BarChart (Recharts) | Avg of `end_cycle_anxiety` | Domain 0–5 |
| Financial Priority Popularity | Horizontal BarChart (Recharts) | Count of each `priorities` value | Color-coded per category |
| Pre-Purchase Check Rates | PieChart (Recharts) | Count of each `balance_check_frequency` | Color-coded per frequency |

---

## 10. Design Tokens

| Token | Value | Usage |
|---|---|---|
| Primary accent | `#10b981` (Emerald 500) | Buttons, active states, icons, chart primary color |
| Primary hover | `#059669` (Emerald 600) | Button hover state |
| Background | `#f9fafb` (Gray 50) | Page background |
| Card background | `#ffffff` | Question cards, chart containers |
| Border | `#e5e7eb` (Gray 200) | Card borders, input borders |
| Font | Inter (system fallback: ui-sans-serif) | All text |
| Border radius | `0.5rem` (8px) base | Cards, inputs, buttons |

---

## 11. Known Issues / Decisions

- **Anon key exposure:** The Supabase anon key is intentionally public — it is designed for browser use. RLS policies on the Supabase side control what operations are permitted.
- **No authentication:** Survey is fully anonymous by design. No user accounts or session tracking.
- **Array storage:** `priorities` is stored as a native PostgreSQL `text[]` array. Supabase returns it as a JavaScript array, handled correctly by the Supabase JS client.
- **No pagination on results:** The results page fetches all rows. If the dataset grows very large (thousands of rows), a server-side aggregation query should replace the current client-side aggregation.
- **Azure env vars:** `VITE_*` environment variables are baked into the static build. If the Supabase project URL or key changes, a rebuild and redeploy is required.
- **PORT / BASE_PATH:** These are now optional in `vite.config.ts`. If absent, `PORT` defaults to `3000` and `BASE_PATH` defaults to `/`. This makes the build safe in Azure's CI environment where neither variable is set.

---

## 12. Monorepo Context

This project lives inside a pnpm monorepo. Key workspace rules:
- Package name: `@workspace/paycycle-survey`
- Run dev: `pnpm --filter @workspace/paycycle-survey run dev`
- Run build: `pnpm --filter @workspace/paycycle-survey run build`
- Build output: `artifacts/paycycle-survey/dist/public/`
- Dependencies are declared in `artifacts/paycycle-survey/package.json` — do not hoist or share with other artifacts
- The shared `artifacts/api-server` Express backend is **not used** by this artifact
- Do not add this artifact to the root `tsconfig.json` references (it is a leaf package)

---

## 13. Deployment Checklist

### Azure Static Web App

- [x] `staticwebapp.config.json` created in `artifacts/paycycle-survey/public/` (auto-copied to build output)
- [x] Root-level `staticwebapp.config.json` created for GitHub Actions auto-detection
- [x] `swa-cli.config.json` created at `artifacts/paycycle-survey/swa-cli.config.json`
- [x] `vite.config.ts` fixed — `PORT` and `BASE_PATH` are now optional (Azure CI safe)
- [x] Production build verified — `dist/public/` generated successfully without Replit env vars
- [x] `staticwebapp.config.json` confirmed present in `dist/public/` after build
- [ ] Azure Static Web App resource created in Azure portal
- [ ] `VITE_SUPABASE_URL` added to Azure Application Settings
- [ ] `VITE_SUPABASE_ANON_KEY` added to Azure Application Settings
- [ ] Build output (`dist/public/`) deployed to Azure
- [ ] Live URL confirmed — survey form loads at root `/`
- [ ] `/results` route confirmed — no 404 on direct navigation

### Supabase RLS Check

- [ ] RLS enabled on `survey_results` table
- [ ] `"Allow public insert"` policy active (anon role, INSERT)
- [ ] `"Allow public select"` policy active (anon role, SELECT)
- [ ] Test insert from deployed Azure URL succeeds
- [ ] Test read from deployed Azure URL succeeds

---

## 14. Dependencies Added

Beyond the base `react-vite` scaffold, the following were added:

| Package | Version | Purpose |
|---|---|---|
| `@supabase/supabase-js` | ^2.101.1 | Supabase client for browser-side DB access |

Pre-installed in the scaffold and actively used:
- `recharts` ^2.15.2 — all three result charts
- `wouter` ^3.3.5 — client-side routing (`/` and `/results`)
- `tailwindcss` — all styling
- `react-hook-form` — not used (vanilla controlled form chosen for simplicity)

---

## 15. Session Log

### April 1, 2026 — Session 2

**Completed:**
- Fixed `vite.config.ts`: `PORT` and `BASE_PATH` made optional with safe defaults — Azure CI builds no longer throw
- Updated `staticwebapp.config.json`: added `responseOverrides` for 404 fallback and security headers (`X-Content-Type-Options`, `X-Frame-Options`, `X-XSS-Protection`)
- Created `artifacts/paycycle-survey/swa-cli.config.json` for one-command SWA CLI deployment
- Created root-level `staticwebapp.config.json` for Azure GitHub Actions auto-detection
- Verified production build succeeds cleanly without Replit environment variables
- Confirmed `staticwebapp.config.json` present in `dist/public/` after build
- Updated `README.md` with full SQL setup including RLS policies, v1.1.0 changelog entry, Azure deployment steps
- Updated `WORKING_NOTES.md` with all session 2 changes and updated deployment checklist

**Left Incomplete:**
- Azure Static Web App resource not yet created in Azure portal
- Supabase RLS policies not yet confirmed active (must verify in Supabase dashboard)
- Final end-to-end test from deployed Azure URL not yet done

### April 1, 2026 — Session 1

**Completed:**
- Created React + Vite artifact (`paycycle-survey`) at preview path `/`
- Installed `@supabase/supabase-js`
- Built `SurveyPage.tsx` — all 6 questions, inline validation, Supabase insert, thank-you screen, error handling
- Built `ResultsPage.tsx` — stat cards, 3 Recharts visualizations, empty state
- Built `Footer.tsx` — shared footer with required attribution text
- Updated `App.tsx` — Wouter router with `/` and `/results` routes
- Updated `index.css` — Emerald Green (#10b981) Tailwind theme
- Created `artifacts/paycycle-survey/public/staticwebapp.config.json` — initial Azure SPA routing fallback
- Fixed `VITE_SUPABASE_URL` secret (initial value was dashboard URL; corrected to `https://qdvldclppobadpoydhiu.supabase.co`)
- Confirmed Supabase connection working — results page loads with 0 responses, no errors
- Generated `README.md` in root directory
- Generated `WORKING_NOTES.md` in root directory
