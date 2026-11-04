*** Settings ***
Documentation     Application Pipeline and Placement - Test Script
Library           SeleniumLibrary    timeout=12s
Resource          InternFlowUI.resource
Suite Setup       Prepare InternFlow Test Data
Suite Teardown    Cleanup InternFlow Test Data
Test Timeout      60s

*** Variables ***
${BROWSER}        chrome
${DELAY}          0.2s
${CANDIDATE}      //div[contains(@class,'bg-white') and contains(@class,'rounded-2xl')][.//button[normalize-space(.)='u-f']]

*** Test Cases ***
1. Open Browser And Login As Company HR
    Open Browser    ${URL}    ${BROWSER}    options=${OPTIONS}
    Set Selenium Speed    ${DELAY}
    Login As    hr-a
    Go To    ${URL}/dashboard/applicants
    Wait Until Page Contains    u-f

2. Review Candidate And Advance To Interview
    Activate Button    xpath:${CANDIDATE}//button[normalize-space(.)='Review']
    Wait Until Page Does Not Contain Element    xpath:${CANDIDATE}//button[normalize-space(.)='Review']
    Activate Button    xpath:${CANDIDATE}//button[normalize-space(.)='Advance to Interview']
    Wait Until Element Is Visible    xpath:${CANDIDATE}//*[normalize-space(.)='Interview in Progress']

3. Extend Internship Offer
    Activate Button    xpath:${CANDIDATE}//button[normalize-space(.)='Pass & Extend Offer']
    Wait Until Element Is Visible    xpath:${CANDIDATE}//*[contains(.,'Offer Extended (Awaiting Student)')]
    Capture Page Screenshot    placement-offer.png

4. Student Confirms The Placement
    Login As    f
    Go To    ${URL}/dashboard/applications
    Activate Button    xpath://button[contains(.,'Accept Offer')]
    Wait Until Page Contains    Confirm Internship Placement
    Activate Button    xpath://button[normalize-space(.)='Yes, Confirm Placement']
    Wait Until Element Is Visible    xpath://button[normalize-space(.)='Request Cancellation']
    Capture Page Screenshot    placement-confirmed.png

5. Student Requests Cancellation And HR Approves
    Activate Button    xpath://button[normalize-space(.)='Request Cancellation']
    Type And Verify    css:.workspace-dialog textarea    Academic schedule changed for this test.
    Activate Button    css:.workspace-dialog button[type=submit]
    Wait Until Page Contains    Cancellation Pending HR Review
    Login As    hr-a
    Go To    ${URL}/dashboard/applicants
    Activate Button    xpath:${CANDIDATE}//button[contains(.,'Approve Release')]
    Wait Until Element Is Visible    xpath:${CANDIDATE}//*[contains(.,'Placement Cancelled')]
    Capture Page Screenshot    placement-cancelled.png

6. Close Browser
    Close Browser
