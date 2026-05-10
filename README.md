# TPM Program Health Dashboard

An AI-powered tool that transforms raw program data into executive-ready risk assessments. Supports manual input and Jira CSV exports.

**Live demo:** [tpm-portfolio-chi.vercel.app](https://tpm-portfolio-chi.vercel.app/)

---

## What it does

Status updates take too long to write and bury the key information. This tool closes the gap between messy project data and clean executive communication in seconds.

Input your program data in one of two ways:
- **Manual entry** -- milestone list, blockers, and exec context
- **Jira CSV upload** -- export directly from Jira and upload the file

The AI analyzes the data and returns:
- Risk level (High / Medium / Low) with color-coded indicators
- Leadership ask -- the one decision needed from leadership, surfaced first
- Executive summary with blocker bullets -- written for a VP audience
- Recommended actions -- top 3 priorities, sequenced by impact
- Milestone tracker -- with assignees and status pills
- PDF export -- ready to send

**Why two input modes?** Not every team uses Jira. Manual entry works for any stack -- Asana, Monday.com, spreadsheets, or nothing at all. The Jira CSV path eliminates manual data entry for teams that do use Jira. The goal was to build something any TPM could use regardless of their tooling.

Jira and similar tools are building native AI summarization features. This tool takes a different approach -- it works outside any specific platform, accepts data from anywhere, and produces a communication artifact designed for leadership consumption, not just an in-tool summary.

Direct Jira API integration via OAuth is the logical next step and is architecturally supported -- excluded here to keep the demo self-contained.

---

## Tech stack

- **Frontend:** Next.js 15, React 19
- **AI:** Anthropic Claude API (Haiku for manual input, Sonnet for Jira CSV parsing)
- **CSV parsing:** Papa Parse
- **PDF export:** jsPDF
- **Deployment:** Vercel

---

## Run locally

**Prerequisites:** Node.js 18+, Anthropic API key

```bash
git clone https://github.com/ananda021/tpm-portfolio.git
cd tpm-portfolio
npm install
```

Create `.env.local` in the root:

```
ANTHROPIC_API_KEY=your-api-key-here
```

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## More tools

This is part of a portfolio of AI tools built to solve real TPM workflow problems. More coming.