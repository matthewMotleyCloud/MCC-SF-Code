@isTest
private class AccountPlanControllerTest {
    @isTest
    static void testGetCurrentYearPlan() {
        // Create test Account
        Account acct = new Account(Name = 'Test Account');
        insert acct;

        // Insert test Account Plan (without Year__c since it's not writeable)
        Account_Plan__c plan = new Account_Plan__c(
            Name = 'FY Plan',
            Start_Date__c = Date.today(),
            End_Date__c = Date.today().addYears(1),
            Account__c = acct.Id,
            Goals__c = 'Expand market share',
            Issues__c = 'Budget constraints',
            Sales_Budget__c = 50000,
            Sales_Forecast__c = 60000,
            Sales_Potential__c = 75000
        );
        insert plan;

        Test.startTest();
        Account_Plan__c result = AccountPlanController.getCurrentYearPlan(acct.Id, '2025');
        Test.stopTest();

        System.assertNotEquals(null, result, 'Expected Account Plan to be returned');
        System.assertEquals(plan.Id, result.Id, 'Returned plan should match the inserted one');
    }
}

