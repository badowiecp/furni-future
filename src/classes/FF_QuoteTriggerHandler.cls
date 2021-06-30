public with sharing class FF_QuoteTriggerHandler implements FF_TriggerHandler{

    public void bulkBefore(){}

    public void bulkAfter(){}

    public void beforeInsert(SObject so){}

    public void beforeUpdate(SObject oldSo, SObject so){}

    public void beforeDelete(SObject so){}

    public void afterInsert(SObject so){
        FF_QuoteEventUtils.sendQuoteIfNotClosed(Trigger.new);
    }

    public void afterUpdate(SObject oldSo, SObject so){}

    public void afterDelete(SObject so){}

    public void andFinally(){}

}