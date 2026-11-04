*** Settings ***
Documentation     Authentication - Login and Logout Test Script
Library           SeleniumLibrary    timeout=12s
Resource          InternFlowUI.resource
Suite Setup       Prepare InternFlow Test Data
Suite Teardown    Cleanup InternFlow Test Data
Test Timeout      60s

*** Variables ***
${BROWSER}        chrome
${EMAIL}          b@test.invalid
${PASSWORD}       password123
${DELAY}          0.2s

*** Test Cases ***
1. Open Browser And Go To Login Page
    Open Browser    ${URL}    ${BROWSER}    options=${OPTIONS}
    Set Selenium Speed    ${DELAY}
    Set English Language
    Wait Until Element Is Visible    id:login-email-input

2. Login With Valid Credentials
    Type And Verify    id:login-email-input    ${EMAIL}
    Type And Verify    id:login-password-input    ${PASSWORD}
    Activate Button    id:login-submit-btn
    Wait Until Location Is    ${URL}/dashboard

3. Verify Logged In Student Name
    ${name}=    Get Text    xpath://aside//*[normalize-space(.)='u-b']
    Should Be Equal    ${name}    u-b
    Page Should Contain    Welcome back, u-b
    Capture Page Screenshot    authentication-dashboard.png

4. Logout And Verify Session Is Cleared
    Activate Button    xpath://button[normalize-space(.)='Sign Out']
    Wait Until Location Is    ${URL}/login
    ${token}=    Execute Javascript    return localStorage.getItem('token');
    Should Be Equal    ${token}    ${NONE}

5. Verify Invalid Login Is Rejected
    Type And Verify    id:login-email-input    nobody@test.invalid
    Type And Verify    id:login-password-input    wrongpass
    Activate Button    id:login-submit-btn
    Wait Until Page Contains    Invalid credentials
    Location Should Be    ${URL}/login
    Capture Page Screenshot    authentication-invalid-login.png

6. Close Browser
    Close Browser
