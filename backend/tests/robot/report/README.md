# InternFlow Project: report-ready Robot tests

These five independent suites perform 40 real checks using Robot Framework,
SeleniumLibrary, the Express API and a disposable PostgreSQL database.
They are additional report-oriented coverage; they overlap the older 20-case
core suite and must not be presented as 60 distinct requirements.

From `InternFlow/backend`:

```powershell
python -m pip install -r tests/robot/requirements.txt
python tests/robot/report/run_report_tests.py --outputdir ../../output/InternFlow_Robot_Report
```

Run all tests in each module in file order. Each module creates fresh fixture
data, starts the actual API and Vite frontend, and closes its own services and
database afterwards. It requires installed npm dependencies, Chrome, Node.js
and a local PostgreSQL role allowed to create databases. The application data
is not reset. Uploads and the Vite cache use guarded temporary directories.

| Suite | Checks |
| --- | --- |
| Authentication | Landing page, invalid/valid login, role selection, student/HR registration and profile creation, GPA privacy, language persistence and logout |
| Job discovery/application | Job publication, browser search and remote filter, valid PDF upload, application/documents, related-company file access and duplicate prevention |
| Pipeline/placement | Company ownership, stored status changes, visible interview notice/offer, concurrent exclusive commitment and HR-reviewed cancellation |
| Daily logbook | Placement access, saved/backdated entry, invalid dates/hours, date uniqueness, approved and cancelled history protection, placement-only totals and private attachments |
| Mentor/evaluation | Explicit score choice, browser form submission, feedback/score/ownership validation, inspection drawer, immutable sign-off, accurate batch count, weekly average and printable evaluation |

Assertions are in `.robot` files. `InternFlowLibrary.py` and `fixture.cjs` provide
HTTP, database SELECT and fixture transport; they do not delegate to the Node
regression test runner or manufacture PASS results. Fixture creation is setup,
not evidence that a product operation succeeded.

The shared `InternFlow.resource` file is required when running copied scripts.
It verifies entered values. For headless Chrome, button activation first uses
Selenium's native click and observes whether a click event arrived; only if no
event was delivered does it activate the same DOM button. This fallback never
sets application state, database rows or asserted results. Follow-up UI/API/DB
assertions must still pass. Expected fallback waits can appear in detailed logs.

Results use Robot's actual `output.xml`, `report.html`, `log.html` and screenshots.
An HTTP error such as 401/403/409 can be a PASS when it is the expected security
or validation response and the protected data is checked to remain unchanged.

Scope: local application integration. Upload tests use the real local storage
adapter, not AWS S3. The printable document is an evaluation report, not a
university-accredited completion certificate. No AWS deployment, load capacity,
uptime, external interview meeting or automatic internship completion is proven.
