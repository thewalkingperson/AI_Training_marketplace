# Failure Exchange

Developer-first marketplace and benchmark platform for reproducible AI coding failures.

## What is included

- Next.js App Router web app for contributors, sponsors, reviewers, and competition participants.
- Prisma schema for submissions, reviews, domain briefs, pricing recommendations, competitions, packs, disputes, and audit events.
- Managed worker scaffolding for validation, pricing, competition scoring, pack export, and payout status updates.
- Demo-friendly services and seed data so the product shape is inspectable before local infra is fully wired.

## Local setup

1. Install Node 20+ and enable `pnpm`.
2. Start PostgreSQL:

```bash
docker compose up -d db
```

3. Install dependencies and prepare the database:

```bash
pnpm install
cp .env.example .env
pnpm prisma:generate
pnpm prisma:push
pnpm prisma:seed
```

4. Run the web app and worker:

```bash
pnpm dev
pnpm worker
```

## Product lanes in this MVP

- `code_repo` submissions from public GitHub repositories only.
- Domain bounty briefs for sponsor-requested failure types such as `devops` and `financial_modeling_code`.
- Sponsor competitions evaluated through a managed runner against dev and hidden holdout case splits.
- Advisory AI pricing that recommends a payout range without enforcing price.

## Project structure

```text
failure_exchange/
├── app
├── components
├── lib
├── prisma
├── runner-images
├── tests
└── worker
```

## Notes

- Spreadsheet and notebook artifacts are represented in the schema for forward compatibility, but the UI and validation pipeline stay developer-first in v1.
- Reviewer approval remains the control point for rights, brief matching, payouts, and challenge eligibility.
