*** Settings ***
Documentation     InternFlow Project acceptance tests against real isolated services.
Library           InternFlowLibrary.py
Library           Collections
Library           SeleniumLibrary    timeout=12s
Suite Setup       Start Test Environment
Suite Teardown    Stop Test Environment
Test Timeout      45s

*** Variables ***
${BROWSER}        chrome
${PASSWORD}       password123

*** Test Cases ***
T01 Reports Enforce Ownership And Mask Sensitive Fields
    [Tags]    auth
    API Status    GET    /api/evaluations/report/a    ${NONE}    401
    API Status    GET    /api/evaluations/report/a    b    403
    API Status    GET    /api/evaluations/report/a?applicationId=app-a    hr-b    403
    API Status    GET    /api/logbook/student/a    hr-b    403
    ${r}=    API Request    GET    /api/profile/student/a    hr-c
    Dictionary Should Not Contain Key    ${r}[body]    gpa
    Dictionary Should Not Contain Key    ${r}[body]    email
    Dictionary Should Not Contain Key    ${r}[body]    studentId
    ${r}=    API Request    GET    /api/profile/student/a    hr-a
    Should Be Equal As Numbers    ${r}[body][gpa]    3.5

T02 Totals Exclude Historical Placement Hours
    [Tags]    logbook
    ${r}=    API Request    GET    /api/evaluations/report/a    a
    Should Be Equal As Integers    ${r}[status]    200
    Should Be Equal As Numbers    ${r}[body][totalHours]    16
    Should Be Equal As Numbers    ${r}[body][approvedHours]    8
    ${logs}=    Set Variable    ${r}[body][dailyLogs]
    FOR    ${log}    IN    @{logs}
        Should Be Equal    ${log}[applicationId]    app-a
    END
    ${r}=    API Request    GET    /api/evaluations/report/a    hr-b
    Should Be Equal    ${r}[body][activeApp][id]    app-old

T03 HR Status Changes Respect Ownership And Workflow
    [Tags]    pipeline
    API Status    PATCH    /api/applications/app-a/status    hr-b    404    {"status":"REJECTED"}
    API Status    PATCH    /api/applications/app-a/status    hr-a    409    {"status":"REJECTED"}
    API Status    PATCH    /api/applications/app-f/status    hr-a    200    {"status":"REVIEWING"}
    API Status    PATCH    /api/applications/app-f/status    hr-a    200    {"status":"INTERVIEW_SCHEDULED"}
    API Status    PATCH    /api/applications/app-f/status    hr-a    409    {"status":"REVIEWING"}
    API Status    PATCH    /api/applications/app-f/status    hr-a    200    {"status":"ACCEPTED"}

T04 Approved Logs Reject Edits And Deletion
    [Tags]    logbook
    API Status    POST    /api/logbook    a    409    {"id":"log-a-approved","logDate":"2026-10-01","hoursWorked":8,"tasksDone":"[\\"Changed\\"]","learnings":"Testing"}
    API Status    DELETE    /api/logbook/log-a-approved    a    409
    API Status    POST    /api/logbook    a    404    {"id":"log-b","logDate":"2026-10-01","hoursWorked":8,"tasksDone":"[\\"Changed\\"]","learnings":"Testing"}
    ${rows}=    Query Fixture    SELECT "tasksDone","mentorApproved" FROM "DailyLog" WHERE id='log-a-approved'
    Should Be Equal    ${rows}[0][tasksDone]    ["Original task"]
    Should Be True    ${rows}[0][mentorApproved]

T05 Approval Stays Within Current Company Placement
    [Tags]    logbook
    API Status    PUT    /api/logbook/log-a-pending/approve    hr-b    403    {"mentorRating":5}
    API Status    PUT    /api/logbook/log-a-pending/approve    hr-a    400    {"mentorRating":6}
    API Status    POST    /api/logbook/batch-approve    hr-a    200    {"studentId":"a","applicationId":"app-a","weekNumber":1,"mentorRating":4}
    ${rows}=    Query Fixture    SELECT "mentorApproved" FROM "DailyLog" WHERE id='log-a-old'
    Should Not Be True    ${rows}[0][mentorApproved]

T06 Rubric Validates Company Student And Score
    [Tags]    evaluation
    ${body}=    Set Variable    {"studentId":"a","applicationId":"app-a","workQualityScore":5,"punctualityScore":4,"teamworkScore":3,"feedback":"Robot review"}
    API Status    POST    /api/evaluations/submit    hr-b    403    ${body}
    API Status    POST    /api/evaluations/submit    hr-a    400    {"studentId":"a","applicationId":"app-a","workQualityScore":6,"punctualityScore":4,"teamworkScore":3,"feedback":"Invalid"}
    API Status    POST    /api/evaluations/submit    hr-a    403    {"studentId":"b","applicationId":"app-a","workQualityScore":5,"punctualityScore":4,"teamworkScore":3,"feedback":"Mismatch"}
    API Status    POST    /api/evaluations/submit    hr-a    200    ${body}
    API Status    POST    /api/evaluations/submit    hr-a    200    ${body}
    ${rows}=    Query Fixture    SELECT id FROM "InternshipEvaluation" WHERE "applicationId"='app-a'
    Length Should Be    ${rows}    1

T07 Concurrent Confirmations Produce One Placement
    [Tags]    pipeline
    ${r}=    Parallel Requests    [{"method":"PATCH","path":"/api/applications/app-c-a/commit","actor":"c","body":{}},{"method":"PATCH","path":"/api/applications/app-c-b/commit","actor":"c","body":{}}]
    ${success}=    Evaluate    sum(x['status'] == 200 for x in $r)
    Should Be Equal As Integers    ${success}    1
    ${rows}=    Query Fixture    SELECT status FROM "Application" WHERE "studentId"='c'
    ${committed}=    Evaluate    sum(x['status'] == 'COMMITTED' for x in $rows)
    ${rejected}=    Evaluate    sum(x['status'] == 'REJECTED' for x in $rows)
    Should Be Equal As Integers    ${committed}    1
    Should Be Equal As Integers    ${rejected}    1

T08 Applying During Commitment Leaves No Competing Application
    [Tags]    pipeline
    ${r}=    Parallel Requests    [{"method":"PATCH","path":"/api/applications/app-d/commit","actor":"d","body":{}},{"method":"POST","path":"/api/applications","actor":"d","body":{"jobPostId":"job-b"}}]
    Should Be Equal As Integers    ${r}[0][status]    200
    ${rows}=    Query Fixture    SELECT status FROM "Application" WHERE "studentId"='d'
    ${valid}=    Evaluate    all(x['status'] in ['COMMITTED','REJECTED'] for x in $rows)
    Should Be True    ${valid}
    API Status    POST    /api/applications    d    400    {"jobPostId":"job-a2"}

T09 Concurrent Applications Enforce One Per Company
    [Tags]    discovery
    ${r}=    Parallel Requests    [{"method":"POST","path":"/api/applications","actor":"e","body":{"jobPostId":"job-a"}},{"method":"POST","path":"/api/applications","actor":"e","body":{"jobPostId":"job-a2"}}]
    ${created}=    Evaluate    sum(x['status'] == 201 for x in $r)
    Should Be Equal As Integers    ${created}    1
    ${rows}=    Query Fixture    SELECT id FROM "Application" WHERE "studentId"='e'
    Length Should Be    ${rows}    1

T10 Job Deletion Preserves Placement Records
    [Tags]    discovery
    API Status    DELETE    /api/jobs/job-a    hr-a    409
    API Status    POST    /api/applications    f    404    {"jobPostId":"job-closed"}
    ${rows}=    Query Fixture    SELECT id FROM "Application" WHERE id='app-a'
    Length Should Be    ${rows}    1

T11 Malformed Profile Dates And Hours Are Rejected
    [Tags]    auth
    API Status    POST    /api/auth/register    ${NONE}    400    {"email":"admin@test.invalid","name":"Admin","password":"password123","role":"UNIVERSITY_ADMIN"}
    API Status    PUT    /api/student/profile    a    400    {"gpa":8}
    API Status    PUT    /api/student/profile    a    400    {"year":7}
    API Status    POST    /api/logbook    g    400    {"id":"log-g","logDate":"2999-01-01","hoursWorked":8,"tasksDone":"[\\"Task\\"]","learnings":"Testing"}
    API Status    POST    /api/logbook    g    400    {"id":"log-g","logDate":"2026-02-30","hoursWorked":8,"tasksDone":"[\\"Task\\"]","learnings":"Testing"}
    API Status    POST    /api/logbook    g    400    {"id":"log-g","logDate":"2026-10-01","hoursWorked":13,"tasksDone":"[\\"Task\\"]","learnings":"Testing"}

T12 Concurrent Edit And Approval Preserve Signed Content
    [Tags]    logbook
    ${r}=    Parallel Requests    [{"method":"POST","path":"/api/logbook","actor":"g","body":{"id":"log-g","logDate":"2026-10-01","weekNumber":1,"hoursWorked":8,"tasksDone":"[\\"Changed\\"]","learnings":"Testing"}},{"method":"PUT","path":"/api/logbook/log-g/approve","actor":"hr-a","body":{"mentorRating":5}}]
    Should Be Equal As Integers    ${r}[1][status]    200
    ${before}=    Query Fixture    SELECT "tasksDone","mentorApproved" FROM "DailyLog" WHERE id='log-g'
    Should Be True    ${before}[0][mentorApproved]
    API Status    POST    /api/logbook    g    409    {"id":"log-g","logDate":"2026-10-01","hoursWorked":8,"tasksDone":"[\\"Tampered\\"]","learnings":"Testing"}
    ${after}=    Query Fixture    SELECT "tasksDone","mentorApproved" FROM "DailyLog" WHERE id='log-g'
    Should Be Equal    ${before}    ${after}

U01 Landing Page Loads Real Job Data
    [Tags]    auth
    Open Test Browser
    Go To    ${WEB}
    Wait Until Page Contains    Intern
    Wait Until Page Contains    job-a
    Capture Page Screenshot    robot-U01-landing.png

U02 Invalid Login Shows Error And Creates No Session
    [Tags]    auth
    Go To    ${WEB}/login
    Type And Verify    css:input[type=email]    nobody@test.invalid
    Type And Verify    css:input[type=password]    wrongpass
    Click Button    css:button[type=submit]
    Wait Until Page Contains    Invalid credentials
    ${token}=    Execute Javascript    return localStorage.getItem('token');
    Should Be Equal    ${token}    ${NONE}
    Capture Page Screenshot    robot-U02-invalid-login.png

U03 Registration Role Buttons Change Selected State
    [Tags]    auth
    Go To    ${WEB}/register
    Wait Until Element Is Visible    xpath://button[.//h3[contains(.,'Company')]]
    Click Button    xpath://button[.//h3[contains(.,'Company')]]
    ${class}=    Get Element Attribute    xpath://button[.//h3[contains(.,'Company')]]    class
    Should Contain    ${class}    border-emerald-600
    Click Button    xpath://button[.//h3[contains(.,'Student')]]
    ${class}=    Get Element Attribute    xpath://button[.//h3[contains(.,'Student')]]    class
    Should Contain    ${class}    border-emerald-600

U04 Student Login Returns To Requested Job Search
    [Tags]    auth
    Go To    ${WEB}/login?redirect=%2Fdashboard%2Fjobs%3Fq%3Djob-a
    Type And Verify    css:input[type=email]    b@test.invalid
    Type And Verify    css:input[type=password]    ${PASSWORD}
    Click Button    css:button[type=submit]
    Wait Until Location Contains    /dashboard/jobs?q=job-a
    Wait Until Page Contains    job-a
    ${user}=    Execute Javascript    return JSON.parse(localStorage.getItem('user')).role;
    Should Be Equal    ${user}    STUDENT

U05 Keyword Search Changes Results And Shows Empty State
    [Tags]    discovery
    Go To    ${WEB}/dashboard/jobs
    Wait Until Page Contains    job-a
    Type And Verify    css:main input    no-such-robot-job
    Wait Until Page Does Not Contain Element    xpath://main//h3[contains(.,'job-a')]
    Wait Until Page Contains    No
    Capture Page Screenshot    robot-U05-empty-search.png
    Clear Element Text    css:main input
    Type And Verify    css:main input    job-b
    Wait Until Page Contains Element    xpath://main//h3[contains(.,'job-b')]
    Page Should Not Contain Element    xpath://main//h3[normalize-space()='job-a']

U06 Student Cannot Open Company Job Management
    [Tags]    auth
    Go To    ${WEB}/dashboard/jobs/manage
    Wait Until Location Is    ${WEB}/dashboard
    Page Should Not Contain Element    xpath://button[contains(.,'Create Job')]

U07 HR Login Opens Own Company Applicants
    [Tags]    pipeline
    Close All Browsers
    Open Test Browser
    Go To    ${WEB}/login
    Type And Verify    css:input[type=email]    hr-a@test.invalid
    Type And Verify    css:input[type=password]    ${PASSWORD}
    Click Button    css:button[type=submit]
    Wait Until Location Is    ${WEB}/dashboard
    Go To    ${WEB}/dashboard/applicants
    Wait Until Page Contains    u-a
    Page Should Not Contain    u-b
    Capture Page Screenshot    robot-U07-company-applicants.png

U08 Mobile Menu Closes With Escape And Page Fits
    [Tags]    auth
    Set Window Size    390    844
    Go To    ${WEB}/dashboard
    Wait Until Element Is Visible    css:button[aria-controls='dashboard-navigation']
    Click Button    css:button[aria-controls='dashboard-navigation']
    Wait Until Element Is Visible    css:#dashboard-navigation
    Press Keys    NONE    ESCAPE
    ${expanded}=    Get Element Attribute    css:button[aria-controls='dashboard-navigation']    aria-expanded
    Should Be Equal    ${expanded}    false
    ${fits}=    Execute Javascript    return document.documentElement.scrollWidth <= window.innerWidth;
    Should Be True    ${fits}
    Capture Page Screenshot    robot-U08-mobile-menu.png

*** Keywords ***
Start Test Environment
    ${url}=    Start Isolated Internflow
    Set Suite Variable    ${WEB}    ${url}

Stop Test Environment
    Run Keyword And Ignore Error    Close All Browsers
    Stop Isolated Internflow

API Status
    [Arguments]    ${method}    ${path}    ${actor}    ${expected}    ${body}=${NONE}
    ${response}=    API Request    ${method}    ${path}    ${actor}    ${body}
    Should Be Equal As Integers    ${response}[status]    ${expected}

Open Test Browser
    Open Browser    about:blank    ${BROWSER}
    ...    options=add_argument("--headless=new");add_argument("--disable-gpu");add_argument("--no-sandbox");add_argument("--window-size=1280,860");add_argument("--disable-features=CalculateNativeWinOcclusion");add_argument("--disable-renderer-backgrounding")
    Go To    ${WEB}/login
    Execute Javascript    localStorage.clear(); localStorage.setItem('internflow_lang','en');
    Reload Page
    Set Selenium Speed    0.2s
    Set Window Size    1280    860

Type And Verify
    [Arguments]    ${locator}    ${text}
    Wait Until Element Is Visible    ${locator}
    Wait Until Keyword Succeeds    4s    200ms    Input And Check    ${locator}    ${text}

Input And Check
    [Arguments]    ${locator}    ${text}
    Input Text    ${locator}    ${text}
    ${actual}=    Get Value    ${locator}
    IF    $actual != $text
        ${element}=    Get WebElement    ${locator}
        Execute Javascript
        ...    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set.call(arguments[0],arguments[1]); arguments[0].dispatchEvent(new Event('input',{bubbles:true}));
        ...    ARGUMENTS    ${element}    ${text}
    END
    Textfield Value Should Be    ${locator}    ${text}
