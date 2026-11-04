*** Settings ***
Documentation     Daily logs, real totals, validation, historical immutability and private attachments.
Resource          InternFlow.resource
Suite Setup       Start Report Test Environment
Suite Teardown    Stop Report Test Environment
Test Timeout      60s

*** Test Cases ***
1. Logbook Requires A Committed Placement
    ${body}=    Create Dictionary    logDate=2026-09-20    hoursWorked=${8}    tasksDone=["Robot task"]    learnings=Testing
    API Status    POST    /api/logbook    f    403    ${body}
    Login As    f
    Go To    ${WEB}/dashboard/logbook
    Wait Until Page Contains Element    id:add-daily-log-btn
    Element Should Be Disabled    id:add-daily-log-btn

2. Save A Backdated Daily Log And Read It From The UI
    ${yesterday}=    Evaluate    (datetime.datetime.now(datetime.timezone(datetime.timedelta(hours=7))) - datetime.timedelta(days=1)).date().isoformat()    modules=datetime
    Set Suite Variable    ${WORK_DATE}    ${yesterday}
    ${body}=    Create Dictionary    logDate=${WORK_DATE}    weekNumber=${2}    hoursWorked=${6}    workModality=REMOTE    supervisorName=Robot Mentor    tasksDone=["Robot completed deliverable"]    learnings=API validation
    ${saved}=    API Status    POST    /api/logbook    a    201    ${body}
    Set Suite Variable    ${LOG_ID}    ${saved}[body][id]
    Should Be True    ${saved}[body][isBackdated]
    Should Be Equal As Numbers    ${saved}[body][hoursWorked]    6
    ${rows}=    Query Fixture    SELECT "tasksDone","isBackdated" FROM "DailyLog" WHERE id='${LOG_ID}'
    Should Be Equal    ${rows}[0][tasksDone]    ["Robot completed deliverable"]
    Should Be True    ${rows}[0][isBackdated]
    Login As    a
    Go To    ${WEB}/dashboard/logbook
    Wait Until Page Contains    Robot completed deliverable
    Capture Page Screenshot    logbook-saved-entry.png

3. Future Dates And Invalid Hours Are Rejected
    ${future}=    Create Dictionary    logDate=2999-01-01    hoursWorked=${8}    tasksDone=["Invalid future task"]    learnings=Testing
    API Status    POST    /api/logbook    a    400    ${future}
    ${hours}=    Create Dictionary    logDate=2026-09-20    hoursWorked=${13}    tasksDone=["Invalid hours"]    learnings=Testing
    API Status    POST    /api/logbook    a    400    ${hours}

4. Duplicate Work Dates Do Not Create Another Entry
    ${body}=    Create Dictionary    logDate=${WORK_DATE}    hoursWorked=${8}    tasksDone=["Duplicate"]    learnings=Testing
    API Status    POST    /api/logbook    a    409    ${body}
    ${rows}=    Query Fixture    SELECT id FROM "DailyLog" WHERE "studentId"='a' AND "logDate"='${WORK_DATE}'::timestamp
    Length Should Be    ${rows}    1

5. Approved Logs Reject Editing And Deletion
    ${body}=    Create Dictionary    id=log-a-approved    logDate=2026-10-01    hoursWorked=${8}    tasksDone=["Changed task"]    learnings=Testing
    API Status    POST    /api/logbook    a    409    ${body}
    API Status    DELETE    /api/logbook/log-a-approved    a    409
    ${rows}=    Query Fixture    SELECT "tasksDone","mentorApproved" FROM "DailyLog" WHERE id='log-a-approved'
    Should Be Equal    ${rows}[0][tasksDone]    ["Original task"]
    Should Be True    ${rows}[0][mentorApproved]

6. Cancelled Placement Logs Are Read Only
    API Status    DELETE    /api/logbook/log-a-old    a    409
    ${rows}=    Query Fixture    SELECT id FROM "DailyLog" WHERE id='log-a-old'
    Length Should Be    ${rows}    1
    ${history}=    API Status    GET    /api/evaluations/report/a?applicationId=app-old    a    200
    Should Be Equal    ${history}[body][dailyLogs][0][id]    log-a-old

7. Current Placement Totals Exclude Historical Hours
    ${result}=    API Status    GET    /api/logbook/my    a    200
    Should Be Equal As Numbers    ${result}[body][totalHours]    22
    Should Be Equal As Numbers    ${result}[body][approvedHours]    8
    FOR    ${entry}    IN    @{result}[body][logs]
        Should Be Equal    ${entry}[applicationId]    app-a
    END

8. Logbook Attachment Is Private To Student And Placement Company
    ${uploaded}=    Upload Test Resume    a
    Should Be Equal As Integers    ${uploaded}[status]    200
    ${url}=    Set Variable    ${uploaded}[body][url]
    ${link}=    Create Dictionary    title=Supporting report    url=${url}
    ${links}=    Create List    ${link}
    ${attachment}=    Evaluate    json.dumps($links)    modules=json
    ${body}=    Create Dictionary    logDate=2026-09-22    weekNumber=${3}    hoursWorked=${8}    tasksDone=["Attached evidence"]    learnings=Testing    attachmentUrl=${attachment}
    API Status    POST    /api/logbook    a    201    ${body}
    ${owner}=    Read Uploaded File    ${url}    a
    Should Be Equal As Integers    ${owner}[status]    200
    ${company}=    Read Uploaded File    ${url}    hr-a
    Should Be Equal As Integers    ${company}[status]    200
    ${other_company}=    Read Uploaded File    ${url}    hr-b
    Should Be Equal As Integers    ${other_company}[status]    404
    ${public}=    Read Public File    ${url}
    Should Be Equal As Integers    ${public}[status]    404
