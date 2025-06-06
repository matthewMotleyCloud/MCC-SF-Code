public with sharing class AccountPlanController {
    @AuraEnabled(cacheable=true)
    public static Account_Plan__c getCurrentYearPlan(Id accountId, String fiscalYear) {
        return [
            SELECT Id, Name, Goals__c, Issues__c, Year__c, Sales_Budget__c, Sales_Forecast__c, Sales_Potential__c, LastModifiedDate
            FROM Account_Plan__c
            WHERE Account__c = :accountId AND Year__c = :fiscalYear
            LIMIT 1
        ];
    }
}