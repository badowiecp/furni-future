trigger FF_ProductRatingTrigger on FF_Product_Rating__c (before insert, before update, before delete, after insert, after update, after delete, after undelete) {

    if (Trigger.isBefore) {
        if (Trigger.isInsert) {
            FF_ProductRatingTriggerHelper.checkIfAlreadyRated(Trigger.new);
        } else if (Trigger.isUpdate) {

        }
    } else if (Trigger.isAfter) {
        if(Trigger.isInsert){
        }else if(Trigger.isUpdate){

        }
    }

}