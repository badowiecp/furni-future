public without sharing class FF_QuoteEventUtils {

    public static void sendQuoteIfNotClosed(List<Quote_event__e> triggerList){
        for (Quote_event__e event : triggerList) {
            if (String.isNotEmpty(event.Opportunity_Id__c)) {
                Set<Id> closedOpportunities = new Set<Id>();
                for (Opportunity wonOpportunity : [SELECT Id,StageName FROM Opportunity WHERE StageName = 'Closed Won']) {
                    closedOpportunities.add(wonOpportunity.Id);
                }
                if (!closedOpportunities.contains(event.Opportunity_Id__c)) {
                    FF_QuoteService.prepareQuoteForOpportunity(event.Opportunity_Id__c);
                }
            }
        }
    }

}