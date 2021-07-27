public without sharing class FF_FurniClubController {

    @AuraEnabled
    public static void addCustomerToClub(String productTypeId, String birthdate) {
        Contact userContact = [SELECT Id,Email FROM Contact WHERE Email = :UserInfo.getUserEmail()];
        insertNewDiscountPriceBook(productTypeId, userContact);
        saveBirthdateAndSetMemberOnContact(birthdate, userContact, productTypeId);
        sendWelcomeEmail(userContact);
    }

    @AuraEnabled
    public static Contact checkIfMember(){
        return [SELECT Id,FF_Furni_Club_member__c,FF_Product_Type_Chosen__c,FF_Club_Member_Discount__c FROM Contact WHERE Email = :UserInfo.getUserEmail()];
    }

    @AuraEnabled
    public static List<MemberWrapper> getMembers(){
        List<MemberWrapper> memberWrappers = new List<MemberWrapper>();
        for(Contact memberContact : [SELECT Id,Email,Name,FF_Furni_Club_member__c,FF_Contact_Name_link__c,FF_Member_Tier__c,FF_Joined_Club_Date__c FROM Contact WHERE FF_Furni_Club_member__c = true]){
            MemberWrapper member = new MemberWrapper();
            member.name = memberContact.Name;
            member.nameLink = memberContact.FF_Contact_Name_link__c;
            member.email = memberContact.Email;
            member.dateJoined = memberContact.FF_Joined_Club_Date__c;
            member.tier = memberContact.FF_Member_Tier__c;
            member.discountPercent = Integer.valueOf([SELECT Id,Discount_Percent__c FROM Pricebook2 WHERE FF_Furni_Club_member__c = :memberContact.Id].Discount_Percent__c);
            List<AggregateResult> results = [SELECT COUNT(Id) cnt ,SUM(TotalAmount) totalAmount FROM Order WHERE Contact__c = :memberContact.Id AND CreatedDate > :memberContact.FF_Joined_Club_Date__c];
            member.ordersCount = (Integer)results[0].get('cnt');
            if((Decimal)results[0].get('totalAmount')!=null){
                member.ordersAmount = (Decimal)results[0].get('totalAmount');
            }else{
                member.ordersAmount = 0;
            }
            memberWrappers.add(member);
        }
        return memberWrappers;
    }

    private static void insertNewDiscountPriceBook(String productTypeId, Contact userContact){
        Pricebook2 pricebook2 = new Pricebook2();
        pricebook2.Name = 'Furni Member ' + userContact.Email;
        pricebook2.Discount_Percent__c = 5;
        pricebook2.FF_Furni_Club_member__c = userContact.Id;
        pricebook2.IsActive = true;
        insert pricebook2;
        List<PricebookEntry> newEntries = new List<PricebookEntry>();
        for (PricebookEntry currentEntry : [SELECT Id,UnitPrice,IsActive,Product2Id FROM PricebookEntry WHERE Pricebook2.IsStandard = true AND Product2.RecordTypeId = :productTypeId AND IsActive = true]) {
            PricebookEntry newEntry = new PricebookEntry();
            newEntry.UnitPrice = currentEntry.UnitPrice * (100 - pricebook2.Discount_Percent__c) / 100;
            newEntry.Product2Id = currentEntry.Product2Id;
            newEntry.Discount__c = pricebook2.Discount_Percent__c;
            newEntry.Pricebook2Id = pricebook2.Id;
            newEntry.IsActive = true;
            newEntries.add(newEntry);
        }
        insert newEntries;
    }

    private static void saveBirthdateAndSetMemberOnContact(String birthdate, Contact userContact,String productTypeId){
        userContact.Birthdate = Date.valueOf(birthdate);
        userContact.FF_Furni_Club_member__c = true;
        userContact.FF_Member_Tier__c = 'Tier I';
        userContact.FF_Club_Member_Discount__c = 5;
        userContact.FF_Product_Type_Chosen__c = [SELECT Id,RecordType.Name FROM Product2 WHERE RecordTypeId = :productTypeId LIMIT 1].RecordType.Name;
        userContact.FF_Joined_Club_Date__c = System.now();
        upsert userContact;
    }

    private static void sendWelcomeEmail(Contact userContact){
        Messaging.SingleEmailMessage message = new Messaging.SingleEmailMessage();
        message.setToAddresses(new String[] { userContact.Email });
        List<OrgWideEmailAddress> addresses = [SELECT Id FROM OrgWideEmailAddress WHERE Address = 'patryk.badowiec@britenet.com.pl'];
        if (!addresses.isEmpty()) {
            message.setOrgWideEmailAddressId(addresses[0].Id);
        }
        message.setTargetObjectId(userContact.Id);
        message.setSaveAsActivity(false);

        EmailTemplate template = [SELECT Id, Subject, HtmlValue FROM EmailTemplate WHERE Name = 'Furni Club Welcome Email'];

        message.setTemplateId(template.Id);
        message.setSubject(template.Subject);
        message.setHtmlBody(template.HtmlValue);
        message.setTreatBodiesAsTemplate(true);
        try {
            Messaging.sendEmail(new Messaging.SingleEmailMessage[] { message });
        } catch (Exception exc) {
            throw exc;
        }
    }

    public class MemberWrapper {
        @AuraEnabled public String name {get;set;}
        @AuraEnabled public String nameLink {get;set;}
        @AuraEnabled public String email {get;set;}
        @AuraEnabled public Datetime dateJoined {get;set;}
        @AuraEnabled public String tier {get;set;}
        @AuraEnabled public Integer discountPercent {get;set;}
        @AuraEnabled public Integer ordersCount {get;set;}
        @AuraEnabled public Decimal ordersAmount {get;set;}
    }

}