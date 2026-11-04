*** Settings ***
Library           ${CURDIR}/../InternFlowLibrary.py
Library           SeleniumLibrary    timeout=12s

*** Variables ***
${PASSWORD}       password123
${OPTIONS}        add_argument("--headless=new");add_argument("--disable-gpu");add_argument("--no-sandbox");add_argument("--window-size=1440,1000");add_argument("--disable-features=CalculateNativeWinOcclusion");add_argument("--disable-renderer-backgrounding")

*** Keywords ***
Prepare InternFlow Test Data
    ${url}=    Start Isolated Internflow
    Set Suite Variable    ${URL}    ${url}
    Set Suite Variable    ${WEB}    ${url}

Set English Language
    Go To    ${URL}/login
    Execute Javascript    localStorage.clear(); localStorage.setItem('internflow_lang','en');
    Reload Page

Cleanup InternFlow Test Data
    Run Keyword And Ignore Error    Close All Browsers
    Stop Isolated Internflow

Login As
    [Arguments]    ${actor}
    Go To    ${WEB}/login
    Execute Javascript    localStorage.clear(); localStorage.setItem('internflow_lang','en');
    Reload Page
    Type And Verify    id:login-email-input    ${actor}@test.invalid
    Type And Verify    id:login-password-input    ${PASSWORD}
    Activate Button    id:login-submit-btn
    Wait Until Location Is    ${WEB}/dashboard

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
        ...    Object.getOwnPropertyDescriptor(arguments[0].tagName === 'TEXTAREA' ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype,'value').set.call(arguments[0],arguments[1]); arguments[0].dispatchEvent(new Event('input',{bubbles:true}));
        ...    ARGUMENTS    ${element}    ${text}
    END
    ${actual}=    Get Value    ${locator}
    Should Be Equal    ${actual}    ${text}


Activate Button
    [Documentation]    Use native Selenium click; activate the same DOM button only if Chrome delivers no click event. Never changes application data or expected results.
    [Arguments]    ${locator}
    Wait Until Element Is Visible    ${locator}
    ${element}=    Get WebElement    ${locator}
    Execute Javascript
    ...    window.robotClickSeen=false; window.robotClickTarget=arguments[0]; window.robotClickObserver=e=>{if(window.robotClickTarget.contains(e.target))window.robotClickSeen=true;}; document.addEventListener('click',window.robotClickObserver,true);
    ...    ARGUMENTS    ${element}
    Click Button    ${locator}
    ${delivered}=    Run Keyword And Return Status
    ...    Wait For Condition    return window.robotClickSeen === true;    timeout=500ms
    IF    not $delivered
        Execute Javascript    arguments[0].click();    ARGUMENTS    ${element}
    END
    Execute Javascript    document.removeEventListener('click',window.robotClickObserver,true); delete window.robotClickObserver; delete window.robotClickTarget;
