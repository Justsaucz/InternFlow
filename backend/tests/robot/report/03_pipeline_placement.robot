*** Settings ***
Documentation     Actual application transitions, exclusive commitment and company-reviewed cancellation.
Resource          InternFlow.resource
Suite Setup       Start Report Test Environment
Suite Teardown    Stop Report Test Environment
Test Timeout      60s

*** Test Cases ***
1. HR Sees Only Own Company Applicants
    Login As    hr-a
    Go To    ${WEB}/dashboard/applicants
    Wait Until Page Contains    u-f
    Page Should Not Contain    u-b
    Capture Page Screenshot    pipeline-own-applicants.png
    API Status    PATCH    /api/applications/app-f/status    hr-b    404    {"status":"REVIEWING"}

2. HR Changes Pending Application To Reviewing
    API Status    PATCH    /api/applications/app-f/status    hr-a    200    {"status":"REVIEWING"}
    Stored Application Status Should Be    app-f    REVIEWING

3. Interview Status Appears On Student Application
    API Status    PATCH    /api/applications/app-f/status    hr-a    200    {"status":"INTERVIEW_SCHEDULED"}
    Stored Application Status Should Be    app-f    INTERVIEW_SCHEDULED
    Login As    f
    Go To    ${WEB}/dashboard/applications
    Wait Until Page Contains    Interview Scheduled
    Wait Until Page Contains    Advanced to Interview Stage
    Capture Page Screenshot    pipeline-interview-notice.png

4. HR Extends An Offer And Student Can Respond
    API Status    PATCH    /api/applications/app-f/status    hr-a    200    {"status":"ACCEPTED"}
    Stored Application Status Should Be    app-f    ACCEPTED
    Reload Page
    Wait Until Element Is Visible    xpath://button[contains(.,'Accept Offer')]
    Capture Page Screenshot    pipeline-offer.png

5. Concurrent Offer Confirmation Produces One Placement
    ${results}=    Parallel Requests    [{"method":"PATCH","path":"/api/applications/app-c-a/commit","actor":"c","body":{}},{"method":"PATCH","path":"/api/applications/app-c-b/commit","actor":"c","body":{}}]
    ${successes}=    Evaluate    sum(r['status'] == 200 for r in $results)
    Should Be Equal As Integers    ${successes}    1
    ${rows}=    Query Fixture    SELECT id,status,"jobPostId" FROM "Application" WHERE "studentId"='c'
    ${active}=    Evaluate    [row for row in $rows if row['status'] == 'COMMITTED']
    ${closed}=    Evaluate    [row for row in $rows if row['status'] == 'REJECTED']
    Length Should Be    ${active}    1
    Length Should Be    ${closed}    1
    Set Suite Variable    ${PLACEMENT_ID}    ${active}[0][id]
    ${company}=    Evaluate    'hr-a' if $active[0]['jobPostId'] == 'job-a' else 'hr-b'
    Set Suite Variable    ${COMPANY}    ${company}
    API Status    POST    /api/applications    c    400    {"jobPostId":"job-a2"}

6. Student Requests Cancellation Without Immediate Release
    API Status    PATCH    /api/applications/${PLACEMENT_ID}/request-cancel    c    200    {"reason":"Changed training plan for this test."}
    Stored Application Status Should Be    ${PLACEMENT_ID}    CANCEL_REQUESTED
    ${other_company}=    Evaluate    'hr-b' if $COMPANY == 'hr-a' else 'hr-a'
    API Status    PATCH    /api/applications/${PLACEMENT_ID}/cancellation-action    ${other_company}    403    {"action":"APPROVE"}
    Stored Application Status Should Be    ${PLACEMENT_ID}    CANCEL_REQUESTED

7. Only Owning HR Can Reject Or Approve Release
    API Status    PATCH    /api/applications/${PLACEMENT_ID}/cancellation-action    ${COMPANY}    200    {"action":"REJECT"}
    Stored Application Status Should Be    ${PLACEMENT_ID}    COMMITTED
    API Status    PATCH    /api/applications/${PLACEMENT_ID}/request-cancel    c    200    {"reason":"Confirmed cancellation request for test."}
    API Status    PATCH    /api/applications/${PLACEMENT_ID}/cancellation-action    ${COMPANY}    200    {"action":"APPROVE"}
    Stored Application Status Should Be    ${PLACEMENT_ID}    CANCELLED
    Login As    c
    Go To    ${WEB}/dashboard/applications
    Wait Until Page Contains    Cancelled
    Capture Page Screenshot    pipeline-cancellation.png
