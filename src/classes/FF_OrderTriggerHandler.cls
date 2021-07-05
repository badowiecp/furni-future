public with sharing class FF_OrderTriggerHandler implements FF_TriggerHandler{

    public void bulkBefore(){}

    public void bulkAfter(){}

    public void beforeInsert(List<SObject> newList){}

    public void beforeUpdate(List<SObject> newList, Map<Id, SObject> newMap, List<SObject> oldList, Map<Id, SObject> oldMap){}

    public void beforeDelete(List<SObject> oldList, Map<Id, SObject> oldMap){}

    public void afterInsert(List<SObject> newList, Map<Id, SObject> newMap){}

    public void afterUpdate(List<SObject> newList, Map<Id, SObject> newMap, List<SObject> oldList, Map<Id, SObject> oldMap){}

    public void afterDelete(List<SObject> oldList, Map<Id, SObject> oldMap){}

    public void andFinally(){}

}