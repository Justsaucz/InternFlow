*** Settings ***
Documentation     Job publishing, real search/filtering, PDF upload and application submission.
Resource          InternFlow.resource
Suite Setup       Start Report Test Environment
Suite Teardown    Stop Report Test Environment
Test Timeout      60s

*** Test Cases ***
1. HR Publishes A Job And Public API Returns It
    ${body}=    Create Dictionary    title=Robot QA Internship    description=Test web applications    requirements=Attention to detail    location=Bangkok    isRemote=${TRUE}    positions=${1}
    ${created}=    API Status    POST    /api/jobs    hr-a    201    ${body}
    Set Suite Variable    ${JOB_ID}    ${created}[body][id]
    ${published}=    API Status    GET    /api/jobs/${JOB_ID}    ${NONE}    200
    Should Be Equal    ${published}[body][title]    Robot QA Internship
    Should Be True    ${published}[body][isActive]

2. Student Searches Actual Job Results
    Login As    e
    Go To    ${WEB}/dashboard/jobs
    Wait Until Page Contains    Robot QA Internship
    Type And Verify    css:main input    Robot QA Internship
    Wait Until Page Contains Element    xpath://main//h3[normalize-space(.)='Robot QA Internship']
    Wait Until Page Does Not Contain Element    xpath://main//h3[normalize-space(.)='job-b']
    Capture Page Screenshot    jobs-keyword-search.png

3. Remote Filter Excludes Onsite Jobs
    Go To    ${WEB}/dashboard/jobs
    Wait Until Page Contains    job-a
    Activate Button    xpath://main//button[normalize-space(.)='Remote / WFH']
    Wait Until Page Contains Element    xpath://main//h3[normalize-space(.)='Robot QA Internship']
    Wait Until Page Does Not Contain Element    xpath://main//h3[normalize-space(.)='job-a']
    Capture Page Screenshot    jobs-remote-filter.png

4. Student Uploads A Real PDF And Ownership Is Stored
    ${upload}=    Upload Test Resume    e
    Should Be Equal As Integers    ${upload}[status]    200
    Set Suite Variable    ${RESUME_URL}    ${upload}[body][url]
    ${metadata}=    Query Fixture    SELECT "ownerId","isPublic","mimeType" FROM "UploadedFile" WHERE "fileUrl"='${RESUME_URL}'
    Length Should Be    ${metadata}    1
    Should Be Equal    ${metadata}[0][ownerId]    u-e
    Should Not Be True    ${metadata}[0][isPublic]
    Should Be Equal    ${metadata}[0][mimeType]    application/pdf

5. Submit Application With Resume And Portfolio Link
    ${resume}=    Create Dictionary    title=Resume    url=${RESUME_URL}
    ${portfolio}=    Create Dictionary    title=Portfolio link    url=https://example.com/robot-portfolio
    ${attachments}=    Create List    ${resume}    ${portfolio}
    ${body}=    Create Dictionary    jobPostId=${JOB_ID}    coverLetter=Robot test application    attachments=${attachments}
    ${submitted}=    API Status    POST    /api/applications    e    201    ${body}
    Set Suite Variable    ${APPLICATION_ID}    ${submitted}[body][application][id]
    Stored Application Status Should Be    ${APPLICATION_ID}    PENDING
    ${documents}=    Query Fixture    SELECT title,"fileUrl" FROM "Document" WHERE "applicationId"='${APPLICATION_ID}'
    Length Should Be    ${documents}    2
    Login As    hr-a
    Go To    ${WEB}/dashboard/applicants
    Wait Until Page Contains    u-e
    Wait Until Page Contains    Robot test application
    Capture Page Screenshot    jobs-submitted-application.png

6. Resume Download Enforces Owner And Related Company
    ${owner}=    Read Uploaded File    ${RESUME_URL}    e
    Should Be Equal As Integers    ${owner}[status]    200
    Should Contain    ${owner}[headers][content-type]    application/pdf
    ${company}=    Read Uploaded File    ${RESUME_URL}    hr-a
    Should Be Equal As Integers    ${company}[status]    200
    ${unrelated}=    Read Uploaded File    ${RESUME_URL}    hr-b
    Should Be Equal As Integers    ${unrelated}[status]    404
    ${public}=    Read Public File    ${RESUME_URL}
    Should Be Equal As Integers    ${public}[status]    404

7. Duplicate Applications And Closed Jobs Are Rejected
    ${same_job}=    Create Dictionary    jobPostId=${JOB_ID}
    API Status    POST    /api/applications    e    400    ${same_job}
    ${same_company}=    Create Dictionary    jobPostId=job-a2
    API Status    POST    /api/applications    e    400    ${same_company}
    ${closed}=    Create Dictionary    jobPostId=job-closed
    API Status    POST    /api/applications    e    404    ${closed}
    ${rows}=    Query Fixture    SELECT id FROM "Application" WHERE "studentId"='e'
    Length Should Be    ${rows}    1
