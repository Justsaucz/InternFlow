*** Settings ***
Documentation     Mentor sign-off, explicit rubric scores, immutable approval and printable evaluation report.
Resource          InternFlow.resource
Suite Setup       Start Report Test Environment
Suite Teardown    Stop Report Test Environment
Test Timeout      60s

*** Test Cases ***
1. New Evaluation Requires Deliberate Score Selection
    Login As    hr-a
    Go To    ${WEB}/dashboard/evaluations
    Wait Until Element Is Visible    xpath://tr[.//button[normalize-space(.)='u-a']]
    Activate Button    xpath://tr[.//button[normalize-space(.)='u-a']]//button[normalize-space(.)='Evaluate']
    Wait Until Element Is Visible    css:.workspace-dialog select
    FOR    ${index}    IN RANGE    1    4
        ${value}=    Get Value    xpath:(//div[contains(@class,'workspace-dialog')]//select)[${index}]
        Should Be Empty    ${value}
    END
    ${valid}=    Execute Javascript    return document.querySelector('.workspace-dialog form').checkValidity();
    Should Not Be True    ${valid}
    Capture Page Screenshot    evaluation-empty-scores.png

2. Submit Rubric Through The Actual Browser Form
    Select From List By Value    xpath:(//div[contains(@class,'workspace-dialog')]//select)[1]    3
    Select From List By Value    xpath:(//div[contains(@class,'workspace-dialog')]//select)[2]    4
    Select From List By Value    xpath:(//div[contains(@class,'workspace-dialog')]//select)[3]    2
    Type And Verify    css:.workspace-dialog textarea    Observed work quality and clear feedback from the Robot test.
    Activate Button    css:.workspace-dialog button[type=submit]
    Wait Until Page Does Not Contain Element    css:.workspace-dialog form
    ${rows}=    Query Fixture    SELECT "workQualityScore","punctualityScore","teamworkScore",feedback FROM "InternshipEvaluation" WHERE "applicationId"='app-a'
    Length Should Be    ${rows}    1
    Should Be Equal As Integers    ${rows}[0][workQualityScore]    3
    Should Be Equal As Integers    ${rows}[0][punctualityScore]    4
    Should Be Equal As Integers    ${rows}[0][teamworkScore]    2
    Should Contain    ${rows}[0][feedback]    Observed work quality
    Capture Page Screenshot    evaluation-submitted-rubric.png

3. Invalid Scores Blank Remarks And Unrelated HR Are Rejected
    ${blank}=    Create Dictionary    studentId=a    applicationId=app-a    workQualityScore=${3}    punctualityScore=${4}    teamworkScore=${2}    feedback=${SPACE}${SPACE}
    API Status    POST    /api/evaluations/submit    hr-a    400    ${blank}
    ${invalid}=    Create Dictionary    studentId=a    applicationId=app-a    workQualityScore=${6}    punctualityScore=${4}    teamworkScore=${2}    feedback=Invalid score
    API Status    POST    /api/evaluations/submit    hr-a    400    ${invalid}
    ${foreign}=    Create Dictionary    studentId=a    applicationId=app-a    workQualityScore=${3}    punctualityScore=${4}    teamworkScore=${2}    feedback=Not my intern
    API Status    POST    /api/evaluations/submit    hr-b    403    ${foreign}
    ${rows}=    Query Fixture    SELECT "workQualityScore",feedback FROM "InternshipEvaluation" WHERE "applicationId"='app-a'
    Should Be Equal As Integers    ${rows}[0][workQualityScore]    3
    Should Contain    ${rows}[0][feedback]    Observed work quality

4. HR Opens The Daily Logbook Inspection Drawer
    Go To    ${WEB}/dashboard/evaluations
    Wait Until Element Is Visible    xpath://tr[.//button[normalize-space(.)='u-a']]
    Activate Button    xpath://tr[.//button[normalize-space(.)='u-a']]//button[@id='review-logbook-btn']
    Wait Until Element Is Visible    css:.workspace-dialog
    Wait Until Page Contains    Original task
    Capture Page Screenshot    evaluation-logbook-inspector.png
    Go To    ${WEB}/dashboard/evaluations

5. Mentor Approves A Daily Log And Stores Feedback
    API Status    PUT    /api/logbook/log-a-pending/approve    hr-b    403    {"mentorRating":2}
    API Status    PUT    /api/logbook/log-a-pending/approve    hr-a    200    {"mentorRating":2,"mentorFeedback":"Reviewed daily deliverables."}
    ${rows}=    Query Fixture    SELECT "mentorApproved","mentorRating","mentorFeedback" FROM "DailyLog" WHERE id='log-a-pending'
    Should Be True    ${rows}[0][mentorApproved]
    Should Be Equal As Integers    ${rows}[0][mentorRating]    2
    Should Be Equal    ${rows}[0][mentorFeedback]    Reviewed daily deliverables.

6. Repeated Approval Cannot Overwrite An Existing Signoff
    API Status    PUT    /api/logbook/log-a-pending/approve    hr-a    409    {"mentorRating":5,"mentorFeedback":"Do not replace the original review."}
    ${rows}=    Query Fixture    SELECT "mentorRating","mentorFeedback" FROM "DailyLog" WHERE id='log-a-pending'
    Should Be Equal As Integers    ${rows}[0][mentorRating]    2
    Should Be Equal    ${rows}[0][mentorFeedback]    Reviewed daily deliverables.

7. Batch Approval Counts Only Newly Approved Logs
    ${first}=    API Status    POST    /api/logbook/batch-approve    hr-a    200    {"studentId":"g","applicationId":"app-g","weekNumber":1,"mentorRating":4}
    Should Be Equal As Integers    ${first}[body][updatedCount]    1
    ${repeat}=    API Status    POST    /api/logbook/batch-approve    hr-a    200    {"studentId":"g","applicationId":"app-g","weekNumber":1,"mentorRating":1}
    Should Be Equal As Integers    ${repeat}[body][updatedCount]    0
    ${rows}=    Query Fixture    SELECT "mentorRating" FROM "DailyLog" WHERE id='log-g'
    Should Be Equal As Integers    ${rows}[0][mentorRating]    4

8. Weekly Rating Averages Approved Daily Ratings
    ${logs}=    API Status    GET    /api/logbook/student/a?applicationId=app-a    hr-a    200
    Should Be Equal As Numbers    ${logs}[body][groupedWeeks][0][mentorRating]    3.5
    Should Be Equal As Integers    ${logs}[body][groupedWeeks][0][ratedDays]    2
    Should Be Equal    ${logs}[body][groupedWeeks][0][mentorFeedback]    ${NONE}

9. Student Opens Printable Evaluation Report With Saved Scores
    Login As    a
    Go To    ${WEB}/dashboard/logbook
    Wait Until Element Is Visible    xpath://button[contains(.,'View Official Report')]
    Activate Button    xpath://button[contains(.,'View Official Report')]
    Wait Until Element Is Visible    css:.workspace-dialog
    ${text}=    Get Text    css:.workspace-dialog
    Should Contain    ${text}    3 / 5
    Should Contain    ${text}    4 / 5
    Should Contain    ${text}    2 / 5
    ${print_buttons}=    Get Element Count    xpath://div[contains(@class,'workspace-dialog')]//button[contains(.,'Print')]
    Should Be True    ${print_buttons} > 0
    Capture Page Screenshot    evaluation-printable-report.png
