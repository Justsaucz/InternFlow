# Cloud preparation - Project only, 3 November 2026

The user confirmed S3, ECS/ECR, RDS, IAM, CloudWatch, VPC, public/private subnets, ALB, and security groups. CloudFront and Secrets Manager were removed from the preparation templates. No AWS resources or account credentials were created or used.

## Changes

- Production backend/runtime and separate migration Docker targets use Node 24 and compiled TypeScript. Runtime runs as a non-root user. Frontend builds to static S3 artifacts, with an Nginx container for local validation.
- Additive reconciliation migration creates missing tables/columns/states and UploadedFile ownership metadata. Existing University rows/relations are retained as ignored legacy schema, and university names are copied to the current field where needed. There are no DROP TABLE/COLUMN operations in the reconciliation migration.
- ECS-role default credentials are used for S3. Selecting S3 does not require static AWS keys. Production refuses silent disk fallback.
- Uploaded private files are read through an authenticated API. Owners and the related company can read only authorized files. Forging a Document reference from another account does not grant access. Public profile images remain publicly readable, while PDFs cannot be uploaded as public profile images.
- Existing file links now fetch protected content with the session token. Legacy metadata can be backfilled for files with a single unambiguous owner. Unsupported/oversize files are rejected and files remain limited to 5MB.
- Explicit allowed frontend origins replace wildcard CORS. Production rejects weak/placeholder JWT secrets, missing required settings, and insecure remote CORS origins.
- Health/readiness and graceful shutdown support were added for the existing API deployment.
- Cloud frontend can use S3 REST HTTPS object hosting with `VITE_ROUTER_MODE=hash` and an explicit HTTPS API origin, avoiding CloudFront. The default local route style is preserved. ALB HTTPS still requires a real domain and trusted certificate; no certificate/domain has been provisioned.

## Local data isolation

Project `.env` now points to `internflow_project_20261103_10df2a9b`, a copy of the original local database, then migrated/backfilled. The original database `internflow` and Teerayut's `.env` and source were not changed. Original environment backup is ignored at `deploy/.env.before-cloud-prep`. No original user records were deleted and no local data was uploaded to AWS.

## Validation

| Verification | Result |
| --- | --- |
| Existing Robot Framework suite | 20/20 pass after the backend/file/config changes |
| Migrations | 3/3 pass: fresh deploy with zero schema drift, historical data preserved, current db-push schema adopted without data loss |
| Local private/public files and CORS | 20/20 checks pass |
| S3-compatible local storage | The same 20/20 checks pass; the SDK obtains temporary credentials through a local container-credential endpoint, with no static access keys supplied to the application |
| Production config guards | 7/7 pass |
| Production Docker build | Runtime/migration/frontend targets build with TLS verification enabled |
| Container integration | Fresh PostgreSQL migration, backend readiness and frontend startup pass |
| Built UI/API workflow | Registration (API), job publication (API), actual browser login, PDF upload/application submission, authenticated HR file preview, commitment, daily-log creation, mentor approval, employer rubric, approved-hour report/print view, cancellation request and HR approval pass (22 checks, including landing navigation/FAQ) |
| Direct-S3 route mode simulation | The final 22-check run uses the built frontend at `/index.html#/...` without a CDN. The earlier same-origin BrowserRouter run passed 15 workflow checks. Both runs are local container evidence, not an AWS deployment. |

Source and evidence: `backend/tests/robot`, `backend/tests/migrations.test.cjs`, `backend/tests/config.test.cjs`, `backend/tests/cloud-files.py`, `backend/tests/s3-role.test.cjs`, and the workspace `tmp/cloud-prep` result files. S3-compatible tests and mock container credentials are local integration evidence, not a claim of successful AWS IAM/S3 access.

## Remaining external validation

When an account is available, verify its IAM permissions, public-read frontend bucket allowance, actual task roles, RDS TLS, private network outbound routing, ALB domain/certificate, memory sizing, logs/alarms, cost and all browser operations from the final URL. Performance/uptime/recovery targets are not established by these checks. The report PDF was not edited in this round; update deployment statements only after actual AWS evidence exists.

The earlier Testing Report questions and minimal changes are documented in `TESTING_REPORT_MINIMAL_CORRECTIONS.md`. This preparation does not add OCR, university approval, interviews/calendar, billing, notifications or completion certification.
