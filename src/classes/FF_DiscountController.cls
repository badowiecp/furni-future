public with sharing class FF_DiscountController {

    @AuraEnabled
    public static List<Pricebook2> fetchPriceBooks(){
        List<Pricebook2> priceBooks = new List<Pricebook2>();
        for(Pricebook2 priceBook : [SELECT Id,Name,IsActive,Description,IsStandard FROM Pricebook2]){
            if(priceBook!=null){
                priceBooks.add(priceBook);
            }
        }
        return priceBooks;
    }

    @AuraEnabled
    public static List<PricebookEntry> getStandardPricebookEntries(){
        List<PricebookEntry> pricebookEntries = new List<PricebookEntry>();
        String standardPricebookId = [SELECT Id,IsActive,IsStandard FROM Pricebook2 WHERE IsStandard = true AND IsActive = true].Id;
        for(PricebookEntry entry : [SELECT Id,UnitPrice,IsActive,Name,Product2Id,Product2.Name FROM PricebookEntry WHERE Pricebook2Id = :standardPricebookId]){
            if(entry!=null){
                pricebookEntries.add(entry);
            }
        }
        return pricebookEntries;
    }

}