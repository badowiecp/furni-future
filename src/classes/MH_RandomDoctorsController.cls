public without sharing class MH_RandomDoctorsController {

    public List<MH_Doctor__c> doctors {get;set;}
    public Integer offset {get;set;}
    public Integer records {get {
        return records =10;
    }set;}
    public Boolean messageSent {get;set;}

    public MH_RandomDoctorsController(){
        random();
        if(System.currentPageReference().getParameters().get('message')=='sent'){
            messageSent = true;
        }
    }

    public void random(){
        offset = Integer.valueof((Math.random() * 100));
        doctors = [SELECT MH_First_name__c,MH_Last_name__c,MH_Date_of_birth__c,MH_Specialization__c FROM MH_Doctor__c LIMIT :records OFFSET :offset];
    }

}