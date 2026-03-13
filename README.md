# MITChoice Engineering Admissions 2025

Production-ready college admission portal — Next.js 14, Prisma + SQLite, NextAuth, Tailwind CSS.

## ⚡ Quick Start (3 commands)

```bash
# 1. Install dependencies
npm install

# 2. Set up database + seed 600 questions + create admin
npm run setup

# 3. Start dev server
npm run dev
```

Open **http://localhost:3000** in your browser.

### Demo Credentials (created by seed)
| Role    | Email                    | Password    |
|---------|--------------------------|-------------|
| Student | demo@mitchoice.com       | student123  |
| Admin   | admin@mitchoice.com      | admin123    |

---

## 🔧 Manual Setup (if npm run setup fails)

```bash
npm install
cp .env.example .env         # edit NEXTAUTH_SECRET if needed
npx prisma db push           # creates SQLite database tables
npm run seed                 # seeds 600 questions + admin/demo users
npm run dev
```

## 🩺 Health Check

Visit **http://localhost:3000/api/health** to verify the database and question bank are ready.

---

## Build & Deploy

```bash
npm run build
npm start
```

### Deploy to Vercel
1. Push to GitHub
2. Import in Vercel dashboard
3. Add environment variables:
   - `DATABASE_URL` — use Neon/Supabase PostgreSQL for serverless
   - `NEXTAUTH_URL` — your Vercel URL
   - `NEXTAUTH_SECRET` — random 32+ char string
4. For PostgreSQL: change `schema.prisma` provider from `sqlite` to `postgresql`
5. Update `DATABASE_URL` to your PostgreSQL connection string

---

## Branch Eligibility Matrix

| Score   | Branches Available              |
|---------|---------------------------------|
| ≥ 90%   | CSE, IT, ECE, EE, ME, CE        |
| 80–89%  | IT, ECE, EE, ME, CE             |
| 70–79%  | EE, ME, CE                      |
| 60–69%  | ME, CE                          |
| 50–59%  | ME, CE                          |
| 40–49%  | CE only                         |
| 35–39%  | BSc (not engineering)           |
| < 35%   | Disqualified                    |

## Environment Variables

```env
# .env (copy from .env.example)
DATABASE_URL="file:./dev.db"          # SQLite for dev; use postgresql:// for prod
NEXTAUTH_URL="http://localhost:3000"  # your app URL
NEXTAUTH_SECRET="at-least-32-random-chars-change-this"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

## API Endpoints

| Method | Route                         | Description                    |
|--------|-------------------------------|--------------------------------|
| GET    | `/api/health`                 | Health check / DB status       |
| POST   | `/api/auth/register`          | Register student               |
| GET    | `/api/quiz`                   | Load quiz questions            |
| POST   | `/api/quiz/save`              | Autosave answers (every 10s)   |
| POST   | `/api/quiz/submit`            | Submit & score quiz            |
| POST   | `/api/branch`                 | Lock branch choice             |
| POST   | `/api/admission`              | Submit admission form          |
| GET    | `/api/pdf/score-card`         | View/print score card          |
| GET    | `/api/pdf/admission-letter`   | View/print admission letter    |
| POST   | `/api/admin/reset-quiz`       | Reset student quiz (admin)     |

## PDF Downloads

Score cards and admission letters open in a **new browser tab** formatted for print.
Use **Ctrl+P → Save as PDF** to download. A "Print / Save as PDF" button is shown at the top.

## Troubleshooting

| Error | Fix |
|-------|-----|
| "Internal server error" on register | Run `npx prisma db push && npm run seed` |
| "Database not ready" | Run `npm run setup` |
| "No questions found" | Run `npm run seed` |
| Quiz doesn't load | Check `/api/health` for DB status |
