# InternFlow

An internship and CWIE workspace for students and company HR/mentors, built with React, Express, Prisma and PostgreSQL.

**Status:** the application and production containers have been verified locally. AWS deployment has not been performed yet. The deployment templates require account-specific permissions, endpoints, networking and a certificate/domain before use.

## Implemented workflow

- Student/company registration and login, role-based navigation, academic profiles, and masking of sensitive academic fields from unrelated users.
- Public internship discovery with keyword, category and work-preference filters; company posting management.
- Application screening, externally coordinated interviews, offers, exclusive placement commitment, and company-reviewed cancellation.
- Daily work logs, attachment references, mentor approval/ratings and placement-specific approved-hour totals. Approved logs are protected against student edits/deletion.
- Three-category employer evaluation and a printable evaluation report. This is not automatic university accreditation or completion certification.
- Local or private S3 uploads with ownership checks; related employers can read the files assigned to their applications/placements. Only profile images are public.
- Thai/English interface support, responsive navigation and a shared green visual design. Translation coverage is still partial.

OCR/transcript verification, numeric stipend filtering, a university portal, built-in interview calendar, automatic notifications, account recovery and billing are not implemented.

## Stack

| Layer | Technology |
| --- | --- |
| Frontend | React 19, Vite, TypeScript, Tailwind CSS |
| API | Express 5, TypeScript, JWT, bcrypt |
| Data | Prisma 7, PostgreSQL 16 |
| Uploads | Multer, AWS SDK v3; ECS task-role credentials for S3 |
| Tests | Robot Framework/SeleniumLibrary, HTTP regression tests, migration/configuration/file-access checks |
| Deployment preparation | Node 24 production Docker targets; S3, ECS Fargate/ECR, RDS, IAM, CloudWatch, VPC/subnets/ALB/security groups |

## Run the verified container setup

Install Docker with Compose. From this repository root, copy `deploy/.env.example` to `deploy/.env.local`. Set separate random hexadecimal values for `DB_PASSWORD` and `JWT_SECRET` (at least 32 characters). Keep that file private and untracked.

```powershell
docker compose -f deploy/compose.local.yml --env-file deploy/.env.local up -d --build --wait
```

Open `http://127.0.0.1:8088`. This setup creates its own database volume, runs migrations, starts the compiled API and serves the built frontend through Nginx. It does not reset an existing local database or create AWS resources. New accounts/jobs can be created through the application; this setup does not automatically seed demo passwords.

```powershell
docker compose -f deploy/compose.local.yml --env-file deploy/.env.local down
```

Stopping without `-v` retains the container database and uploads. The legacy root development Compose file is not the production deployment path; use the verified setup above and the deployment runbook.

## Native development

Use Node 24, PostgreSQL 16 and Python 3.12+ for Robot tests. Create `backend/.env` from its example, point it at the intended local database, and install dependencies in both folders.

```powershell
cd backend
npm ci
npx prisma generate
npm run db:migrate
npm run dev
```

In another terminal:

```powershell
cd frontend
npm ci
npm run dev
```

Default ports are 4000 (API) and 3000 (Vite). The frontend uses `VITE_API_URL` when supplied. Do not run migrations against an unrelated or shared production database. For existing local uploads, review `npm run uploads:backfill` in dry-run mode before adding `-- --apply`; ambiguous ownership remains private.

## Verification

The API/migration tests create uniquely named disposable databases and require a local PostgreSQL role with CREATE DATABASE permission. They do not reset the application database.

```powershell
cd backend
npm test
node --test tests/migrations.test.cjs tests/config.test.cjs
python -m pip install -r tests/robot/requirements.txt
python -m robot --outputdir ../../output/robot tests/robot/internflow.robot
python tests/cloud-files.py
```

`tests/s3-role.test.cjs` additionally supports an isolated S3-compatible test server through `S3RVER_MODULE` and `PYTHON_BINARY`. This is local SDK/temporary-credential-provider evidence, not a claim of successful AWS IAM/S3 access.

The UI was checked at desktop, tablet and mobile widths. These checks do not establish production capacity, uptime, disaster recovery or a bug-free guarantee.

## Deployment and project scope

- [Current AWS preparation/runbook](deploy/README.md): direct S3 REST HTTPS frontend hosting with hash routes, HTTPS ALB API, private ECS/RDS/storage. No CloudFront or Secrets Manager in the selected initial plan.
- [Cloud preparation and validation](docs/CLOUD_PREPARATION_2026-11-03.md)
- [Bug fixes and independent submission scope](docs/BUGFIXES_2026-11-03.md)
- [Testing Report corrections](docs/TESTING_REPORT_MINIMAL_CORRECTIONS.md)
- [Workspace styling and verified unused-code cleanup](docs/WORKSPACE_REFRESH_AND_CLEANUP_2026-11-03.md)
- [Minimal report text replacements outside Testing](docs/REPORT_LINE_EDITS_2026-11-03.md)

This repository is the **Project / DES424 version**. The independent Teerayut submission shares the refreshed visual language but may have different functions. Its source and local data are not included in this repository.

Never publish `.env` files, credentials, private uploads, database copies/backups, or local build CA bundles. The frontend S3 bucket contains only public build artifacts; uploads/configuration belong in separate private buckets.
