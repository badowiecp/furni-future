public with sharing class FF_WebToLeadHandler {

    public static void setPersonalLeadForLeadsWithoutCompany(List<Lead> triggerList){
        List<Id> personalLeadsIds = new List<Id>();
        for(Lead insertLead : triggerList){
            if(insertLead.Company.contains('[not provided]')){
                personalLeadsIds.add(insertLead.Id);
            }
        }
        List<Lead> personalLeads = [SELECT Id,RecordType.Name FROM Lead WHERE Id IN :personalLeadsIds];
        if(personalLeads.size()>0){
            for(Lead personalLead : personalLeads){
                personalLead.RecordTypeId = [SELECT Id FROM RecordType WHERE Name = 'Personal Lead'].Id;
            }
            List<Lead> personalLeadsAfterUpdate = [SELECT Id,RecordType.Name FROM Lead WHERE Id IN :personalLeadsIds];
            List<Database.SaveResult> results = Database.update(personalLeads);
        }
    }

}