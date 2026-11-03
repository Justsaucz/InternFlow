# Project / InternFlow readiness review - 3 November 2026

Scope: `D:\Work2\Project\InternFlow`, the DES424 submission. This review does not modify application behavior, AWS resources, the report PDF, or the independent Teerayut submission.

The initial review below records the state before cloud preparation. **Follow-up: the listed code/deployment gaps have now been addressed and checked locally; see `../deploy/README.md` and `CLOUD_PREPARATION_2026-11-03.md`. AWS deployment itself remains unverified because there is no AWS account available yet.** Passing local tests is not proof that every feature, user input, or AWS configuration is correct.

## Fresh verification

| Check | Result |
| --- | --- |
| Robot Framework integration suite | 20 passed, 0 failed: 12 API/database and 8 Selenium browser cases |
| Frontend TypeScript | Passed (`tsc -b`) |
| Frontend production build | Passed (`vite build --emptyOutDir false`) |
| Backend TypeScript | Passed (`tsc --noEmit`) |

The fresh Robot output is in `../../tmp/readiness-2026-11-03/robot/`: `output.xml`, `log.html`, and `report.html`. The suite uses its own temporary PostgreSQL database, frontend and API processes, and test accounts, with suite teardown. It does not reset or seed the demonstration database. The previous PDF/package evidence was not overwritten.

Coverage includes ownership and profile masking, placement-specific totals, permitted HR state changes, approved-log immutability, company approval scope, rubric validation, concurrent commitments/applications/approval, history-preserving deletion, input rejection, browser login/error, role selection, keyword/empty search, role navigation, applicant roster, and mobile-menu behavior.

Build warning: the main frontend JavaScript bundle is approximately 539 KB before gzip. Existing `dist` assets are retained because of the previously encountered directory-delete restriction. A successful build does not demonstrate that production Docker images or AWS services have been tested.

## Required before AWS deployment

1. **Bring migrations into agreement with the current schema.** `backend/prisma/migrations` contains only the old initialization and application-uniqueness migration. It does not create `DailyLog`, `WeeklyLog`, or `InternshipEvaluation`, or add the current placement status values. The current tests use `prisma db push`, so their passing result does not validate `prisma migrate deploy` on a fresh RDS database. Prepare and verify a non-destructive migration path appropriate to the target database.
2. **Fix upload storage for the ECS task role.** `backend/src/routes/upload.routes.ts` explicitly supplies access-key credentials and selects S3 only when `AWS_ACCESS_KEY_ID` and the bucket are set. An ECS role alone currently selects local storage. Configure role-based S3 access and verify actual upload/read behavior before using Fargate.
3. **Protect private uploaded documents.** `backend/src/index.ts` exposes local `/uploads` with unauthenticated static serving. Student resumes/transcripts need authorized downloads and an appropriate private S3 access design; API record ownership does not currently protect every referenced file URL.
4. **Prepare production configuration.** Dockerfiles run development servers. Prepare production images/static frontend hosting, configure the public HTTPS API URL at frontend build time, require a strong JWT secret, and restrict allowed frontend origins. Current CORS permits all origins and JWT code contains a fallback secret if configuration is missing.

These are existing-system deployment/security gaps, not a request to add new product functions. No resources have been created in AWS.

## Remaining validation gaps

The fresh suite does not exercise every complete write flow through the UI. Successful account registration, new job publication, a new application with uploaded attachments, a complete cancellation request/approve/reject sequence, new daily-entry form submission, and printing need additional end-to-end checks. There is no fresh AWS, S3, RDS, load, uptime, or recovery test. Translation coverage remains partial. The existing printable report is not accredited university completion certification.
