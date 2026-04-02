# Financial Security Awareness Survey

![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![License: MIT](https://img.shields.io/badge/License-MIT-green.svg?style=for-the-badge)

## Description

A web application designed to evaluate personal financial habits and cybersecurity awareness. It helps users identify gaps in their financial protection while providing data for analysis on wealth management safety. Responses are collected anonymously and stored in a Supabase PostgreSQL database, with aggregated results visualized on a dedicated results dashboard.

---

## Features

- **Secure Data Entry** — All form submissions are handled over HTTPS with Supabase Row Level Security (RLS) enforcing public insert-only access.
- **Real-Time Supabase Integration** — Survey responses are written to and read from a live Supabase PostgreSQL database with no intermediate backend required.
- **Responsive Design** — Fully responsive layout built with Tailwind CSS, optimized for desktop and mobile browsers.
- **Progress Tracking** — Six sequential questions guide users from easiest to hardest, measuring financial behavior patterns including end-of-cycle anxiety.
- **Summary Results Page** — A `/results` dashboard displays aggregated, anonymized data using Recharts — including bar charts, a horizontal priority breakdown, and a pie chart for pre-purchase check rates.

---

## Tech Stack

| Technology | Purpose |
|---|---|
| HTML / JavaScript (React + Vite) | Frontend framework and build tooling |
| Supabase | PostgreSQL database and REST API |
| Vite | Development server and production build tool |
| Azure Static Web Apps | Cloud hosting and client-side routing |

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v18 or higher
- [pnpm](https://pnpm.io/) v8 or higher (`npm install -g pnpm`)
- A [Supabase](https://supabase.com/) account with a `survey_results` table (see SQL below)

### Database Setup

Run the following SQL in your Supabase project's SQL Editor to create the table and enable public access:

```sql
-- Create the survey_results table
CREATE TABLE IF NOT EXISTS survey_results (
  id          bigserial PRIMARY KEY,
  created_at  timestamptz NOT NULL DEFAULT now(),
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

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/financial-security-survey.git
   cd financial-security-survey
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Configure environment variables**

   Create a `.env` file inside `artifacts/paycycle-survey/`:
   ```env
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-public-key
   ```

4. **Start the development server**
   ```bash
   pnpm --filter @workspace/paycycle-survey run dev
   ```

5. **Open in browser**

   Navigate to `http://localhost:3000` to view the survey form, or `http://localhost:3000/results` for the results dashboard.

---

## Building for Production

```bash
pnpm --filter @workspace/paycycle-survey run build
```

Output is written to `artifacts/paycycle-survey/dist/public/`. This folder is what you deploy to Azure.

---

## Deploying to Azure Static Web Apps

1. Create a **Static Web App** resource in the Azure Portal.
2. In **Configuration → Application settings**, add:
   - `VITE_SUPABASE_URL` = `https://your-project-id.supabase.co`
   - `VITE_SUPABASE_ANON_KEY` = your anon key
3. Run the production build (see above).
4. Deploy using the SWA CLI:
   ```bash
   npx swa deploy artifacts/paycycle-survey/dist/public \
     --deployment-token <your-azure-deployment-token> \
     --env production
   ```

> **Note:** `VITE_*` variables are baked into the static bundle at build time. They must be set **before** building — they are not read at runtime.

---

## Project Structure

```
financial-security-survey/
├── artifacts/
│   └── paycycle-survey/
│       ├── public/
│       │   └── staticwebapp.config.json   # Azure routing config (copied to dist on build)
│       ├── src/
│       │   ├── components/
│       │   │   └── Footer.tsx             # Shared footer component
│       │   ├── lib/
│       │   │   └── supabase.ts            # Supabase client and type definitions
│       │   ├── pages/
│       │   │   ├── SurveyPage.tsx         # 6-question survey form with validation
│       │   │   └── ResultsPage.tsx        # Recharts results dashboard
│       │   ├── App.tsx                    # Wouter router and app shell
│       │   ├── index.css                  # Tailwind CSS theme (Emerald #10b981)
│       │   └── main.tsx                   # React entry point
│       ├── swa-cli.config.json            # Azure SWA CLI deployment config
│       ├── package.json
│       ├── tsconfig.json
│       └── vite.config.ts                 # Build config (PORT/BASE_PATH optional for Azure)
├── staticwebapp.config.json               # Root-level copy for Azure GitHub integration
├── lib/
│   ├── api-spec/                          # OpenAPI spec and codegen config
│   ├── api-client-react/                  # Generated React Query hooks
│   ├── api-zod/                           # Generated Zod validation schemas
│   └── db/                               # Drizzle ORM schema and DB connection
├── artifacts/api-server/                  # Express API server (shared, unused by this app)
├── pnpm-workspace.yaml                    # pnpm monorepo workspace config
├── package.json                           # Root scripts and shared dev dependencies
├── README.md                              # This file
└── WORKING_NOTES.md                       # Internal project tracking (not public)
```

---

## Changelog

### v1.1.0 — April 1, 2026

- Fixed `vite.config.ts` to not require `PORT` or `BASE_PATH` during Azure CI builds
- Improved `staticwebapp.config.json`: added `responseOverrides` for 404 fallback and security headers
- Added `swa-cli.config.json` for streamlined SWA CLI deployment
- Added root-level `staticwebapp.config.json` for GitHub Actions Azure integration
- Verified production build succeeds without Replit environment variables
- Added full SQL table setup with RLS policies to README

### v1.0.0 — April 1, 2026

- Initial release of the Financial Security Awareness Survey
- Six-question survey form with inline validation (text, dropdown, radio, checkboxes)
- Thank-you confirmation screen on successful submission
- Real-time Supabase PostgreSQL integration with public insert RLS policy
- Results dashboard with Recharts: anxiety bar chart, priority horizontal bar chart, pre-purchase check pie chart
- Emerald Green (#10b981) brand theme throughout
- Azure Static Web Apps deployment config (`staticwebapp.config.json`)
- Footer attribution on every page: "Survey by Sumika Thapa, BAIS:3300 - spring 2026"

---

## Author

**Sumika Thapa**
University of Iowa — BAIS:3300, Spring 2026

---

## License

This project is licensed under the [MIT License](https://opensource.org/licenses/MIT).

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
