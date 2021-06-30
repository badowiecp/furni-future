trigger FF_LeadTrigger on Lead (before insert, before update, before delete, after insert, after update, after delete, after undelete) {

    FF_TriggerFactory.createHandler(Lead.SObjectType);

}