public without sharing class FF_FurniClubTierManager {

    public static void checkOrders(List<OrderItem> orderItems){
        List<SObject> recordsToUpdate = new List<SObject>();
        Order order = [SELECT Id,Contact__c FROM Order WHERE Id =:orderItems[0].OrderId];
        Contact member = [SELECT Id,Name,FF_Joined_Club_Date__c,FF_Member_Tier__c,FF_Furni_Club_member__c FROM Contact WHERE Id = :order.Contact__c];
        if(member.FF_Furni_Club_member__c){
            Pricebook2 pricebook = [SELECT Id,Discount_Percent__c FROM Pricebook2 WHERE FF_Furni_Club_member__c = :order.Contact__c];
            Decimal totalOrdersAmount = getTotalOrdersAmount(order.Contact__c, member.FF_Joined_Club_Date__c, orderItems);
            if(totalOrdersAmount > 10000 && member.FF_Member_Tier__c == 'Tier I'){
                member.FF_Member_Tier__c = 'Tier II';
                member.FF_Club_Member_Discount__c = 10;
                pricebook.Discount_Percent__c = 10;
                recordsToUpdate.add(member);
                recordsToUpdate.add(pricebook);
            }else if(totalOrdersAmount > 20000 && member.FF_Member_Tier__c == 'Tier II'){
                member.FF_Member_Tier__c = 'Tier III';
                member.FF_Club_Member_Discount__c = 15;
                pricebook.Discount_Percent__c = 15;
                recordsToUpdate.add(member);
                recordsToUpdate.add(pricebook);
            }
            if(!recordsToUpdate.isEmpty()){
                upsert recordsToUpdate;
                recalculatePricebookEntries(pricebook.Id,Integer.valueOf(pricebook.Discount_Percent__c));
            }
        }
    }

    private static Decimal getTotalOrdersAmount(String contactId, Datetime dateJoined, List<OrderItem> orderItems){
        List<AggregateResult> results = [SELECT SUM(TotalAmount) totalAmount FROM Order WHERE Contact__c = :contactId AND CreatedDate > :dateJoined];
        return (Decimal)results[0].get('totalAmount');
    }

    private static void recalculatePricebookEntries(String pricebookId, Integer discount){
        List<PricebookEntry> entries = new List<PricebookEntry>();
        Map<Id,Decimal> standardPrices = new Map<Id, Decimal>();
        for(PricebookEntry entry : [SELECT Id,UnitPrice,Product2Id FROM PricebookEntry WHERE Pricebook2.IsStandard = true]){
            standardPrices.put(entry.Product2Id,entry.UnitPrice);
        }
        for(PricebookEntry entry : [SELECT Id,Discount__c,UnitPrice,Product2Id FROM PricebookEntry WHERE Pricebook2Id = :pricebookId]){
            Decimal standardPrice = standardPrices.get(entry.Product2Id);
            entry.Discount__c = discount;
            entry.UnitPrice = standardPrice * (100 - discount) / 100;
            entries.add(entry);
        }
        upsert entries;
    }

}