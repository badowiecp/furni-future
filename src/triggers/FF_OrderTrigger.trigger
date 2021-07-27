trigger FF_OrderTrigger on Order (before insert, before update, before delete, after insert, after update, after delete, after undelete) {

    FF_TriggerFactory.createHandler(Order.SObjectType);

}