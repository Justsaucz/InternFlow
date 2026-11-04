*** Settings ***
Documentation     Authentication and user management against real InternFlow services.
Resource          InternFlow.resource
Suite Setup       Start Report Test Environment
Suite Teardown    Stop Report Test Environment
Test Timeout      60s

*** Test Cases ***
1. Landing Page Loads Published Jobs
    Go To    ${WEB}
    Wait Until Page Contains    Intern
    Wait Until Page Contains    job-a
    Capture Page Screenshot    auth-landing.png

2. Invalid Login Shows Error And Creates No Session
    Go To    ${WEB}/login
    Type And Verify    id:login-email-input    nobody@test.invalid
    Type And Verify    id:login-password-input    wrongpass
    Activate Button    id:login-submit-btn
    Wait Until Page Contains    Invalid credentials
    ${token}=    Execute Javascript    return localStorage.getItem('token');
    Should Be Equal    ${token}    ${NONE}
    Capture Page Screenshot    auth-invalid-login.png

3. Registration Role Buttons Change Selected State
    Go To    ${WEB}/register
    Activate Button    xpath://button[.//h3[contains(.,'Company')]]
    ${class}=    Get Element Attribute    xpath://button[.//h3[contains(.,'Company')]]    class
    Should Contain    ${class}    border-emerald-600
    Activate Button    xpath://button[.//h3[contains(.,'Student')]]
    ${class}=    Get Element Attribute    xpath://button[.//h3[contains(.,'Student')]]    class
    Should Contain    ${class}    border-emerald-600

4. Register Student And Initialize Profile
    ${body}=    Create Dictionary    email=robot-student@test.invalid    password=${PASSWORD}    name=Robot Student    role=STUDENT
    API Status    POST    /api/auth/register    ${NONE}    201    ${body}
    ${rows}=    Query Fixture    SELECT u.role,s.id FROM "User" u JOIN "StudentProfile" s ON s."userId"=u.id WHERE u.email='robot-student@test.invalid'
    Length Should Be    ${rows}    1
    Should Be Equal    ${rows}[0][role]    STUDENT

5. Register Company And Initialize Profile
    ${body}=    Create Dictionary    email=robot-hr@test.invalid    password=${PASSWORD}    name=Robot Company    role=COMPANY_HR
    API Status    POST    /api/auth/register    ${NONE}    201    ${body}
    ${rows}=    Query Fixture    SELECT u.role,c.id FROM "User" u JOIN "CompanyProfile" c ON c."userId"=u.id WHERE u.email='robot-hr@test.invalid'
    Length Should Be    ${rows}    1
    Should Be Equal    ${rows}[0][role]    COMPANY_HR

6. Valid Student Login Creates Student Session
    Login As    b
    ${role}=    Execute Javascript    return JSON.parse(localStorage.getItem('user')).role;
    Should Be Equal    ${role}    STUDENT
    ${token}=    Execute Javascript    return localStorage.getItem('token');
    Should Not Be Empty    ${token}
    Capture Page Screenshot    auth-student-dashboard.png

7. GPA Is Visible Only To Owner And Related Company
    ${related}=    API Status    GET    /api/profile/student/a    hr-a    200
    Should Be Equal As Numbers    ${related}[body][gpa]    3.5
    ${unrelated}=    API Status    GET    /api/profile/student/a    hr-c    200
    Dictionary Should Not Contain Key    ${unrelated}[body]    gpa
    Dictionary Should Not Contain Key    ${unrelated}[body]    email
    API Status    GET    /api/profile/student/a    ${NONE}    401

8. Language Toggle Updates Navigation And Persists Selection
    Activate Button    xpath://button[normalize-space(.)='TH']
    Wait Until Page Contains    ออกจากระบบ
    ${language}=    Execute Javascript    return localStorage.getItem('internflow_lang');
    Should Be Equal    ${language}    th
    Reload Page
    Wait Until Page Contains    ออกจากระบบ
    Activate Button    xpath://button[normalize-space(.)='EN']
    Wait Until Page Contains    Sign Out
    Capture Page Screenshot    auth-language-toggle.png

9. Logout Clears Browser Session
    Activate Button    xpath://button[contains(normalize-space(.),'Sign Out')]
    Wait Until Location Is    ${WEB}/login
    ${token}=    Execute Javascript    return localStorage.getItem('token');
    ${user}=    Execute Javascript    return localStorage.getItem('user');
    Should Be Equal    ${token}    ${NONE}
    Should Be Equal    ${user}    ${NONE}
