# E2E Outline

Manual smoke scenarios for the MVP:

1. Contributor visits `/submit`, creates a `code_repo` submission, and confirms the response includes a new submission ID.
2. Reviewer visits `/review`, approves the new case through `POST /api/reviews/:id/decision`, and confirms the queue shrinks.
3. Sponsor opens `/dashboard/sponsor`, publishes a `devops` brief, then creates a pack via `POST /api/packs`.
4. Participant opens `/competitions/release-guardian-challenge`, submits an agent config, and confirms leaderboard placement.
