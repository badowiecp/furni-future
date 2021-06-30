public with sharing class FF_ProductRatingTriggerHandler implements FF_TriggerHandler{

    public void bulkBefore(){}

    public void bulkAfter(){}

    public void beforeInsert(SObject so){
        FF_ProductRatingTriggerHelper.checkIfAlreadyRated(Trigger.new);
    }

    public void beforeUpdate(SObject oldSo, SObject so){}

    public void beforeDelete(SObject so){}

    public void afterInsert(SObject so){}

    public void afterUpdate(SObject oldSo, SObject so){}

    public void afterDelete(SObject so){}

    public void andFinally(){}

}