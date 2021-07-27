trigger FF_ProductRatingTrigger on FF_Product_Rating__c (before insert, before update, before delete, after insert, after update, after delete, after undelete) {

    FF_TriggerFactory.createHandler(FF_Product_Rating__c.SObjectType);

}