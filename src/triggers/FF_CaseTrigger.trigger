trigger FF_CaseTrigger on Case (before insert, before update, before delete, after insert, after update, after delete, after undelete) {

    if(Trigger.isBefore){
        if(Trigger.isInsert){
        }
    }else if(Trigger.isAfter){
        if(Trigger.isInsert){
            FF_CommunityWebToCaseService.assignToQueue(Trigger.new);
        }
    }

}