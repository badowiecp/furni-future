trigger FF_LeadTrigger on Lead (before insert, before update, before delete, after insert, after update, after delete, after undelete) {

    if (Trigger.isBefore) {
        if (Trigger.isInsert) {
        } else if (Trigger.isUpdate) {

        }
    } else if (Trigger.isAfter) {
        if(Trigger.isInsert){
            FF_WebToLeadHandler.setPersonalLeadForLeadsWithoutCompany(Trigger.new);
        }else if(Trigger.isUpdate){
        }
    }

}