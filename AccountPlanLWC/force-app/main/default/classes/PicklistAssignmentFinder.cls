public class PicklistAssignmentFinder {
    public class InputWrapper {
        @InvocableVariable(required=true)
        public Id opportunityId;
    }

    public class OutputWrapper {
        @InvocableVariable
        public Id assignmentId;
        @InvocableVariable
        public String keyword;
        @InvocableVariable
        public String market;
        @InvocableVariable
        public String marketSegment;
    }

    public class KeywordLengthComparator implements Comparator<Picklist_Assignment__c> {
        public Integer compare(Picklist_Assignment__c a, Picklist_Assignment__c b) {
            return b.Keyword__c.length() - a.Keyword__c.length();
        }
    }

    @InvocableMethod(label='Find Best Match Picklist Assignment')
    public static List<OutputWrapper> findBestMatch(List<InputWrapper> inputs) {
        Set<Id> oppIds = new Set<Id>();
        for (InputWrapper input : inputs) {
            if (input.opportunityId != null) {
                oppIds.add(input.opportunityId);
            }
        }

        Map<Id, Opportunity> oppMap = new Map<Id, Opportunity>(
            [SELECT Id, Name, Market__c, Market_Segment__c FROM Opportunity WHERE Id IN :oppIds]
        );

        // Query all assignments and sort by keyword length descending
        List<Picklist_Assignment__c> allAssignments = [
            SELECT Id, Keyword__c, Market__c, Market_Segment__c FROM Picklist_Assignment__c
            WHERE Keyword__c != null
        ];

        // Use instance sort method
        allAssignments.sort(new KeywordLengthComparator());

        List<OutputWrapper> results = new List<OutputWrapper>();

        for (InputWrapper input : inputs) {
            Opportunity opp = oppMap.get(input.opportunityId);
            if (opp == null || String.isBlank(opp.Name)) continue;

            String oppName = opp.Name.toLowerCase();
            OutputWrapper match = null;
            for (Picklist_Assignment__c pa : allAssignments) {
                if (oppName.contains(pa.Keyword__c.toLowerCase())) {
                    match = new OutputWrapper();
                    match.assignmentId = pa.Id;
                    match.keyword = pa.Keyword__c;
                    match.market = pa.Market__c;
                    match.marketSegment = pa.Market_Segment__c;
                    break; // Only grab the first (longest) match
                }
            }
            if (match != null) {
                results.add(match);
            }
        }

        return results;
    }
}
