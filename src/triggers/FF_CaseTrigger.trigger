trigger FF_CaseTrigger on Case (before insert, before update, before delete, after insert, after update, after delete) {

    FF_TriggerFactory.createHandler(Case.SObjectType);

}