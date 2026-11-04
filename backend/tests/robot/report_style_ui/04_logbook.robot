*** Settings ***
Documentation     CWIE Daily Logbook - Test Script
Library           SeleniumLibrary    timeout=12s
Resource          InternFlowUI.resource
Suite Setup       Prepare InternFlow Test Data
Suite Teardown    Cleanup InternFlow Test Data
Test Timeout      60s

*** Variables ***
${BROWSER}        chrome
${TASK}           Robot UI daily deliverable
${DELAY}          0.2s

*** Test Cases ***
1. Open Browser And Login As Placed Student
    Open Browser    ${URL}    ${BROWSER}    options=${OPTIONS}
    Set Selenium Speed    ${DELAY}
    Login As    a

2. Open Daily Logbook And Add An Entry
    Go To    ${URL}/dashboard/logbook
    Wait Until Element Is Enabled    id:add-daily-log-btn
    Activate Button    id:add-daily-log-btn
    Wait Until Element Is Visible    css:.workspace-dialog input[type=date]

3. Enter Work Date Hours And Deliverables
    ${date}=    Evaluate    (datetime.datetime.now(datetime.timezone(datetime.timedelta(hours=7))) - datetime.timedelta(days=1)).date().isoformat()    modules=datetime
    Type And Verify    css:.workspace-dialog input[type=date]    ${date}
    Type And Verify    xpath:(//div[contains(@class,'workspace-dialog')]//input[@type='number'])[1]    2
    Type And Verify    xpath:(//div[contains(@class,'workspace-dialog')]//input[@type='number'])[2]    6
    Type And Verify    xpath://input[starts-with(@placeholder,'e.g. Implemented OAuth')]    ${TASK}
    Type And Verify    xpath:(//div[contains(@class,'workspace-dialog')]//textarea)[last()]    Learned to validate and document API behavior.

4. Save Daily Log And Verify It Appears
    Activate Button    css:.workspace-dialog button[type=submit]
    Wait Until Page Does Not Contain Element    css:.workspace-dialog form
    Wait Until Page Contains    ${TASK}
    Page Should Contain    Backdated Entry
    Capture Page Screenshot    logbook-saved.png

5. Reload And Verify The Entry Persists
    Reload Page
    Wait Until Page Contains    ${TASK}
    ${task}=    Get Text    xpath://span[normalize-space(.)='${TASK}']
    Should Be Equal    ${task}    ${TASK}
    Page Should Contain    Pending Review
    Capture Page Screenshot    logbook-persisted.png

6. Close Browser
    Close Browser
