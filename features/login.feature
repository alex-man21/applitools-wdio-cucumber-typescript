Feature: The Internet Guinea Pig Website

Background: 
        When user navigate to www.google.com page
        Given system configures Applitool Eye true with AppName Disaster Verification and test Name Test 1
       


  Scenario Outline: As a user, I can log into the secure area

    #Given user navigate to <url> page
    #When I login with <username> and <password>
    #Then I should see a flash message saying <message>
    When system takes Visual Snapshot Question Page
    And Close applitool eye

    Examples:
      | url                                      |username | password             | message                        |
      |https://sandbox.disasterverification.com/redcross/Decision/Questions/864238-623873 |tomsmith | SuperSecretPassword! | You logged into a secure area! |
   
