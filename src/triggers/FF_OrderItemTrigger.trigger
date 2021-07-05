trigger FF_OrderItemTrigger on OrderItem (before insert, before update, before delete, after insert, after update, after delete, after undelete) {

    FF_TriggerFactory.createHandler(OrderItem.SObjectType);

}