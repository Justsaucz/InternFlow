# InternFlow DES424 Robot Framework tests

This suite applies only to `Project/InternFlow`. It adds no product features.
It executes 12 HTTP/database cases and 8 SeleniumLibrary browser cases.
The report module screenshots are filtered views of one 20-case integration run.

From `InternFlow/backend`:

```powershell
python -m pip install -r tests/robot/requirements.txt
python -m robot --outputdir ../../output/robot/InternFlow_DES424 tests/robot/internflow.robot
```

Prerequisites: installed frontend/backend npm dependencies, Python 3.10+,
Node.js, Chrome and a compatible ChromeDriver, and local PostgreSQL.
Selenium Manager resolves the installed Chrome/driver. Set `NODE_BINARY` to the
absolute Node executable path if it is not on PATH. Selenium Manager may need
network access to obtain the matching driver on first use.

`fixture.cjs` reads `backend/.env`, requires a local database host, creates a
random `internflow_test_<16 hex digits>` database, applies the current Prisma
schema, and creates its own data. The DB role needs CREATE DATABASE permission.
It starts the actual Express API and Vite frontend on unused loopback ports.
The demo database is never reset or seeded. Suite teardown kills only the
processes the fixture started and drops only its guarded temporary DB name.
Do not run tests against a production database or remove the local-host guard.

The cases share a fixture and must execute in file order. The student browser
session is shared by U01-U06; U07 creates a fresh company browser session.
Use the complete suite when reproducing the reported 20/20 result.

Robot assertions check real HTTP responses, SELECT queries against the fixture,
and application browser state. InternFlowLibrary is transport/setup only and
does not call the existing Node test runner. `Type And Verify` uses Selenium
Input Text, with a native input setter/input-event fallback when the headless
driver leaves a controlled field unchanged. Login and search tests still
require the application to process the value and produce the expected result.

Generated files: `output.xml`, `log.html`, `report.html`, and UI screenshots.
`auth/`, `discovery/`, `pipeline/`, `logbook/`, `evaluation/` contain reports
filtered by tag from the complete output (not additional executions).
NOT TESTED acceptance rows in the PDF are intentionally not marked ACCEPT.
