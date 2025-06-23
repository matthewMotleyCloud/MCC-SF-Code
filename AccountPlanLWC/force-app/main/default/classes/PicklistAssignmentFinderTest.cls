@isTest
private class PicklistAssignmentFinderTest {
    @isTest
    static void testFindBestMatch() {
        // Create test Opportunities
        Opportunity opp1 = new Opportunity(Name = 'BigTech - Health Market', StageName = 'Prospecting', CloseDate = Date.today(), Market__c = 'Retail', Market_Segment__c = 'Grocery');
        Opportunity opp2 = new Opportunity(Name = 'NonMatching Opportunity', StageName = 'Prospecting', CloseDate = Date.today(), Market__c = 'Controlled Environments', Market_Segment__c = 'Mortuary');
        insert new List<Opportunity>{opp1, opp2};

        // Create Picklist Assignments
        Picklist_Assignment__c assignment1 = new Picklist_Assignment__c(
            Keyword__c = 'Health',
            Market__c = 'Retail',
            Market_Segment__c = 'Drug & Dollar'
        );
        Picklist_Assignment__c assignment2 = new Picklist_Assignment__c(
            Keyword__c = 'Tech',
            Market__c = 'Foodservice',
            Market_Segment__c = 'Quick Serve Restaurant'
        );
        insert new List<Picklist_Assignment__c>{assignment1, assignment2};

        // Prepare InputWrapper list correctly
        List<PicklistAssignmentFinder.InputWrapper> inputs = new List<PicklistAssignmentFinder.InputWrapper>();

        PicklistAssignmentFinder.InputWrapper input1 = new PicklistAssignmentFinder.InputWrapper();
        input1.opportunityId = opp1.Id;
        inputs.add(input1);

        PicklistAssignmentFinder.InputWrapper input2 = new PicklistAssignmentFinder.InputWrapper();
        input2.opportunityId = opp2.Id;
        inputs.add(input2);

        PicklistAssignmentFinder.InputWrapper input3 = new PicklistAssignmentFinder.InputWrapper();
        input3.opportunityId = null;
        inputs.add(input3);

        // Run the method
        Test.startTest();
        List<PicklistAssignmentFinder.OutputWrapper> results = PicklistAssignmentFinder.findBestMatch(inputs);
        Test.stopTest();

        // Assertions
        System.assertEquals(1, results.size(), 'Only one opportunity name should match a keyword');
        System.assertEquals('Health', results[0].keyword);
        System.assertEquals('Retail', results[0].market);
        System.assertEquals('Drug & Dollar', results[0].marketSegment);
        System.assertNotEquals(null, results[0].assignmentId);
    }
}

