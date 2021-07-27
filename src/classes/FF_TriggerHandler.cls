public interface FF_TriggerHandler {

    void bulkBefore();

    void bulkAfter();

    void beforeInsert(List<SObject> newList);

    void beforeUpdate(List<SObject> newList, Map<Id, SObject> newMap, List<SObject> oldList, Map<Id, SObject> oldMap);

    void beforeDelete(List<SObject> oldList, Map<Id, SObject> oldMap);

    void afterInsert(List<SObject> newList, Map<Id, SObject> newMap);

    void afterUpdate(List<SObject> newList, Map<Id, SObject> newMap, List<SObject> oldList, Map<Id, SObject> oldMap);

    void afterDelete(List<SObject> oldList, Map<Id, SObject> oldMap);

    void andFinally();

}