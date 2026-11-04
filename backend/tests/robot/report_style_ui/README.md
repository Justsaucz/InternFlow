# InternFlow: six-step browser scripts in the report example style

Each module uses `*** Settings ***`, `*** Variables ***` and six numbered
`*** Test Cases ***`: open browser, perform the workflow, inspect actual page
content, and close browser. Main scripts use SeleniumLibrary browser actions.
No application states, hours or grades are invented as a substitute for checks.

From `InternFlow/backend`:

```powershell
python -m pip install -r tests/robot/requirements.txt
python tests/robot/report_style_ui/run_ui_tests.py --outputdir ../../output/InternFlow_Robot_UI_Style
```

Keep `InternFlowUI.resource`, `InternFlowLibrary.py` and `fixture.cjs` with the
scripts. Setup creates fictional data and starts separate real services on free
local ports. The `${URL}` variable comes from this setup. It does not reset the
application database. A real generated PDF is selected using `Choose File`.

The resource contains reliable field entry and button activation for headless
Chrome, using the same documented helpers as the detailed suite. It never writes
application state or expected test outcomes. Application, placement, logbook and
evaluation operations in these five scripts are performed through the UI.

There are 30 workflow-step tests, including the five open-browser and five
close-browser steps. This is not 30 independent business requirements. The
earlier 40-case detailed API/UI suite remains separate; coverage overlaps and
the counts must not be added as distinct features or acceptance requirements.

Results match these six-step scripts and must not reuse the earlier 40-case
images. Report titles (`Robot Test`, module name and `Test Script`) are supplied
outside `.robot` syntax in the copyable deliverable.

This is local integration evidence. It does not prove AWS deployment, load
capacity, internship-hour completion or university-accredited certification.
