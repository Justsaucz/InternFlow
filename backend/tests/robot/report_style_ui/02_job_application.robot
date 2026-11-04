*** Settings ***
Documentation     Job Discovery and Application - Test Script
Library           SeleniumLibrary    timeout=12s
Resource          InternFlowUI.resource
Suite Setup       Prepare InternFlow Test Data
Suite Teardown    Cleanup InternFlow Test Data
Test Timeout      60s

*** Variables ***
${BROWSER}        chrome
${KEYWORD}        job-a
${PORTFOLIO}      https://example.com/robot-portfolio
${DELAY}          0.2s

*** Test Cases ***
1. Open Browser And Login As Student
    Open Browser    ${URL}    ${BROWSER}    options=${OPTIONS}
    Set Selenium Speed    ${DELAY}
    Login As    e

2. Search A Job And Open Application Form
    Go To    ${URL}/dashboard/jobs
    Type And Verify    css:main input    ${KEYWORD}
    Wait Until Page Contains Element    xpath://h3[normalize-space(.)='${KEYWORD}']
    Activate Button    xpath://div[contains(@class,'group')][.//h3[normalize-space(.)='${KEYWORD}']]//button[contains(.,'Apply for Position')]
    Wait Until Element Is Visible    css:.workspace-dialog textarea

3. Upload Resume And Add Portfolio Link
    ${resume}=    Create Test Resume File
    Choose File    xpath:(//div[contains(@class,'workspace-dialog')]//input[@type='file'])[1]    ${resume}
    Wait Until Page Contains Element    xpath://input[contains(@value,'robot-resume.pdf')]
    Activate Button    xpath://button[normalize-space(.)='Add Link']
    Type And Verify    xpath:(//input[starts-with(@placeholder,'Label / Document Name')])[last()]    Portfolio
    Type And Verify    xpath:(//input[starts-with(@placeholder,'URL (https://')])[last()]    ${PORTFOLIO}
    Type And Verify    css:.workspace-dialog textarea    Robot browser application

4. Submit The Application
    Activate Button    css:.workspace-dialog button[type=submit]
    Wait Until Page Contains    Application Submitted!
    Capture Page Screenshot    application-submitted.png

5. Verify Saved Application And Attachments
    Go To    ${URL}/dashboard/applications
    Wait Until Page Contains    job-a
    Page Should Contain    Pending Review
    Page Should Contain    robot-resume.pdf
    Page Should Contain    Portfolio
    Capture Page Screenshot    application-saved-attachments.png

6. Close Browser
    Close Browser
