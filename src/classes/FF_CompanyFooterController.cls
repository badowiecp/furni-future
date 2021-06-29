public without sharing class FF_CompanyFooterController {

    @AuraEnabled
    public static Organization getFooterInformation(){
        Organization org = [SELECT Id,Address,Name,Phone FROM Organization];
        return org;
    }

}