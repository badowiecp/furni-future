public with sharing class FF_CommunityWebToCaseService {

    public static void assignToQueue(List<Case> cases){
        List<Case> newCases = queryInsertedCases(cases);
        Set<Id> communityUsersIds = getAllUsersWithDesiredProfile('Furni Future Customer Community User');
        if(communityUsersIds.contains(UserInfo.getUserId())){
            for(Case newCase : newCases){
                if(newCase.Reason == 'Payment issues'){
                    newCase.EntitlementId = [SELECT Id FROM Entitlement WHERE Name = 'Furni Future Payment Support'].Id;
                }
                assignToQueue(newCase);
            }
        }
        upsert newCases;
    }

    private static List<Case> queryInsertedCases(List<Case> cases){
        Set<Id> newCasesIds = new Set<Id>();
        for(Case newCase : cases){
            if(newCase!=null){
                newCasesIds.add(newCase.Id);
            }
        }
        List<Case> newCases = new List<Case>();
        for(Case insertedCase : [SELECT Id,Reason FROM Case WHERE Id IN :newCasesIds]){
            if(insertedCase!=null){
                newCases.add(insertedCase);
            }
        }
        return newCases;
    }

    private static Set<Id> getAllUsersWithDesiredProfile(String profileName){
        Set<Id> usersIds = new Set<Id>();
        for(User user : [SELECT Id FROM User WHERE Profile.Name = :profileName]){
            if(user!=null){
                usersIds.add(user.Id);
            }
        }
        return usersIds;
    }

    private static void assignToQueue(Case newCase){
        List<Schema.PicklistEntry> caseReasons = getPicklistValues(Case.Reason);
        Map<String, Id> queues = getQueues();
        for(Schema.PicklistEntry caseReason : caseReasons){
            if(newCase.Reason==caseReason.getLabel()){
                newCase.OwnerId = queues.get(caseReason.getLabel());
            }
        }
    }

    private static List<Schema.PicklistEntry> getPicklistValues(Schema.sObjectField field) {
        List<Schema.PicklistEntry> entries = field.getDescribe().getPickListValues();
        List<Schema.PicklistEntry> activeEntries = new List<Schema.PicklistEntry>();
        for (Schema.PicklistEntry entry : entries) {
            if (entry.isActive()) {
                activeEntries.add(entry);
            }
        }
        return activeEntries;
    }

    private static Map<String, Id> getQueues(){
        Map<String, Id>  queues = new Map<String, Id>();
        for(QueueSobject queueSobject : [SELECT Id,Queue.Name,QueueId FROM QueueSobject]){
            if(queueSobject!=null){
                queues.put(queueSobject.Queue.Name,queueSobject.QueueId);
            }
        }
        return queues;
    }

}