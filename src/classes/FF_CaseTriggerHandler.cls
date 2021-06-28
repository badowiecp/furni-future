public with sharing class FF_CaseTriggerHandler extends FF_TriggerHandler{

    public FF_CaseTriggerHandler(){
        super();
    }

    public void afterInsert(){
        FF_CommunityWebToCaseService.assignToQueue(Trigger.new);
    }

}