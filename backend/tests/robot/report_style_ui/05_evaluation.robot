*** Settings ***
Documentation     Mentor Review and Evaluation Report - Test Script
Library           SeleniumLibrary    timeout=12s
Resource          InternFlowUI.resource
Suite Setup       Prepare InternFlow Test Data
Suite Teardown    Cleanup InternFlow Test Data
Test Timeout      60s

*** Variables ***
${BROWSER}        chrome
${DELAY}          0.2s
${STUDENT_ROW}    //tr[.//button[normalize-space(.)='u-a']]

*** Test Cases ***
1. Open Browser And Login As Company HR
    Open Browser    ${URL}    ${BROWSER}    options=${OPTIONS}
    Set Selenium Speed    ${DELAY}
    Login As    hr-a
    Go To    ${URL}/dashboard/evaluations

2. Inspect Student Daily Logbook
    Activate Button    xpath:${STUDENT_ROW}//button[@id='review-logbook-btn']
    Wait Until Page Contains    Original task
    Capture Page Screenshot    evaluation-inspection.png
    Go To    ${URL}/dashboard/evaluations

3. Open Evaluation And Enter Scores And Feedback
    Activate Button    xpath:${STUDENT_ROW}//button[normalize-space(.)='Evaluate']
    Wait Until Element Is Visible    css:.workspace-dialog select
    Select From List By Value    xpath:(//div[contains(@class,'workspace-dialog')]//select)[1]    3
    Select From List By Value    xpath:(//div[contains(@class,'workspace-dialog')]//select)[2]    4
    Select From List By Value    xpath:(//div[contains(@class,'workspace-dialog')]//select)[3]    2
    Type And Verify    css:.workspace-dialog textarea    Specific observations from the Robot browser test.

4. Submit Evaluation And Verify Saved Scores
    Activate Button    css:.workspace-dialog button[type=submit]
    Wait Until Page Does Not Contain Element    css:.workspace-dialog form
    Go To    ${URL}/dashboard/evaluations
    Activate Button    xpath:${STUDENT_ROW}//button[contains(.,'Edit Rubric')]
    ${quality}=    Get Value    xpath:(//div[contains(@class,'workspace-dialog')]//select)[1]
    ${punctuality}=    Get Value    xpath:(//div[contains(@class,'workspace-dialog')]//select)[2]
    ${teamwork}=    Get Value    xpath:(//div[contains(@class,'workspace-dialog')]//select)[3]
    Should Be Equal    ${quality}    3
    Should Be Equal    ${punctuality}    4
    Should Be Equal    ${teamwork}    2

5. Student Opens Printable Evaluation Report
    Login As    a
    Go To    ${URL}/dashboard/logbook
    Activate Button    xpath://button[contains(.,'View Official Report')]
    Wait Until Element Is Visible    css:.workspace-dialog
    ${report}=    Get Text    css:.workspace-dialog
    Should Contain    ${report}    3 / 5
    Should Contain    ${report}    4 / 5
    Should Contain    ${report}    2 / 5
    Capture Page Screenshot    evaluation-printable-report.png

6. Close Browser
    Close Browser
