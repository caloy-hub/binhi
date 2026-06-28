# BINHI — Setup Guide
## Building Instruction through Narrated and Harmonized Intelligence
## Stack: React + Supabase + Netlify + Claude AI

---

## PREREQUISITES
Make sure these are installed on your computer:
- Node.js v18+ → https://nodejs.org
- Git → https://git-scm.com
- Netlify CLI → `npm install -g netlify-cli`

---

## STEP 1 — PROJECT SETUP (Terminal)

```bash
# Navigate into the project folder
cd matatag-app

# Install all dependencies
npm install

# Copy the environment file
cp .env.example .env
```

---

## STEP 2 — SUPABASE SETUP

1. Go to https://supabase.com and open your project
2. Click **SQL Editor** in the left sidebar
3. Paste the entire contents of `supabase-schema.sql`
4. Click **Run** — this creates all tables, policies, and seed data

5. Get your keys:
   - Go to **Project Settings → API**
   - Copy **Project URL** → paste as `VITE_SUPABASE_URL` in your `.env`
   - Copy **anon public key** → paste as `VITE_SUPABASE_ANON_KEY` in your `.env`

6. Enable Email Auth:
   - Go to **Authentication → Providers**
   - Make sure **Email** is enabled
   - For development, you can disable "Confirm email" under Auth Settings

---

## STEP 3 — ANTHROPIC API KEY

1. Go to https://console.anthropic.com
2. Click **API Keys → Create Key**
3. Copy the key → paste as `ANTHROPIC_API_KEY` in your `.env`

Your `.env` file should now look like:
```
VITE_SUPABASE_URL=https://xxxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGci...
ANTHROPIC_API_KEY=sk-ant-api03-...
```

---

## STEP 4 — RUN LOCALLY

```bash
# Start Netlify dev server (runs React + Netlify Functions together)
netlify dev
```

Open http://localhost:8888 in your browser.

> ⚠️ Use `netlify dev` (not `npm run dev`) — this loads Netlify Functions
> which is where the Claude API calls happen.

Test the full flow:
1. Create an account
2. Go to Lesson Plan → fill in Grade 7, Filipino, Q1 W1
3. Enter a competency and click Generate
4. You should see a full lesson plan appear after ~30 seconds

---

## STEP 5 — DEPLOY TO NETLIFY

### Option A: Deploy via Netlify CLI (fastest)

```bash
# Login to Netlify
netlify login

# Initialize and deploy
netlify init

# When prompted:
# - Create & configure a new site → yes
# - Team → select your team
# - Site name → e.g. matatag-generator (or leave blank for random name)

# Deploy to production
netlify deploy --prod
```

### Option B: Deploy via GitHub (recommended for ongoing updates)

```bash
# Initialize git repo
git init
git add .
git commit -m "Initial MATATAG generator"

# Push to GitHub (create a new repo on github.com first)
git remote add origin https://github.com/YOUR_USERNAME/matatag-app.git
git push -u origin main
```

Then on Netlify:
1. Go to https://app.netlify.com
2. Click **Add new site → Import an existing project**
3. Connect your GitHub repo
4. Build settings are auto-detected from `netlify.toml`

---

## STEP 6 — SET ENVIRONMENT VARIABLES ON NETLIFY

After deploying, add your secrets:

```bash
netlify env:set VITE_SUPABASE_URL "https://your-project.supabase.co"
netlify env:set VITE_SUPABASE_ANON_KEY "your-anon-key"
netlify env:set ANTHROPIC_API_KEY "sk-ant-your-key"
```

Or via the Netlify dashboard:
- Site → **Site configuration → Environment variables → Add variable**

Then trigger a redeploy:
```bash
netlify deploy --prod
```

---

## STEP 7 — SUPABASE AUTH REDIRECT (Production)

1. Go to Supabase → **Authentication → URL Configuration**
2. Set **Site URL** to your Netlify URL (e.g. `https://matatag-generator.netlify.app`)
3. Add to **Redirect URLs**: `https://matatag-generator.netlify.app/**`

---

## PROJECT STRUCTURE

```
matatag-app/
├── netlify/
│   └── functions/
│       ├── generate-lesson-plan.js   ← Claude LP generation
│       └── generate-las.js           ← Claude LAS generation
├── src/
│   ├── components/
│   │   └── Layout.jsx                ← Sidebar + nav
│   ├── data/
│   │   └── curriculum.js             ← MATATAG grade/subject/week data
│   ├── lib/
│   │   └── supabase.js               ← Supabase client
│   ├── pages/
│   │   ├── AuthPage.jsx              ← Login / Signup
│   │   ├── Dashboard.jsx             ← Home screen
│   │   ├── GenerateLessonPlan.jsx    ← LP generator
│   │   ├── GenerateLAS.jsx           ← LAS generator
│   │   └── MyDocuments.jsx           ← Saved documents viewer
│   ├── App.jsx                       ← Router + auth guard
│   ├── main.jsx                      ← React entry point
│   └── index.css                     ← Global styles + CSS vars
├── supabase-schema.sql               ← Run this in Supabase SQL Editor
├── netlify.toml                      ← Build + functions config
├── .env.example                      ← Environment variable template
└── package.json
```

---

## ADDING MORE COMPETENCIES

You can bulk-add competencies to the `competencies` table in Supabase:

```sql
INSERT INTO competencies (grade_level, subject, quarter, week_start, week_end, competency_code, competency_description)
VALUES
  ('Grade 8', 'Science', 1, 1, 2, 'S8Q1W1', 'Explain the different types of mixtures...'),
  ('Grade 9', 'Mathematics', 2, 1, 2, 'M9Q2W1', 'Illustrates the different types of quadrilaterals...');
```

Or build an admin panel later that lets you import from CSV.

---

## WHAT EACH FUNCTION COSTS (Anthropic API)

Each generation call uses approximately:
- Lesson Plan: ~2,500–3,500 output tokens → ~$0.009–$0.013 per plan
- LAS: ~2,000–3,000 output tokens → ~$0.007–$0.011 per sheet

At 100 teachers generating 5 docs/day = ~$5–7/day.

---

## NEXT FEATURES TO BUILD

1. **Competency picker** — dropdown that fetches from the `competencies` table
2. **Edit generated content** — rich text editor (TipTap or Quill)
3. **Export to DOCX** — using docx.js for proper Word format
4. **School admin panel** — manage teachers across a school
5. **Batch generation** — generate a whole week's worth at once
6. **Templates** — save your own LP templates for reuse
7. **AI revision** — "Make this more interactive" follow-up edits

---

## TROUBLESHOOTING

**"Function not found" error**
→ Make sure you're running `netlify dev`, not `npm run dev`

**Supabase auth not working**
→ Check that your VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are correct in `.env`
→ Make sure email auth is enabled in Supabase dashboard

**Claude API error**
→ Check ANTHROPIC_API_KEY is set (in Netlify env vars for production)
→ Make sure you have API credits at console.anthropic.com

**RLS errors ("permission denied")**
→ Make sure you ran the full schema SQL including the RLS policies section
