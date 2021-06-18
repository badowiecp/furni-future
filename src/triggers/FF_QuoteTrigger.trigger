trigger FF_QuoteTrigger on Quote_event__e (after insert) {

    for (Quote_event__e event : Trigger.New) {
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