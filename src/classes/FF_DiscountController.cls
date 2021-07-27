public with sharing class FF_DiscountController {

    @AuraEnabled
    public static ResponseWrapper fetchPriceBooks(Integer pageNumber, Integer recordToDisplay) {
        ResponseWrapper responseWrapper = new ResponseWrapper();
        responseWrapper.recordToDisplay = recordToDisplay;
        responseWrapper.pageNumber = pageNumber;
        List<Pricebook2> priceBooks = new List<Pricebook2>();
        try {
            for (Pricebook2 priceBook : [SELECT Id,Name,IsActive,Description,IsStandard,Discount_Percent__c FROM Pricebook2 WHERE IsStandard = false AND Pricebook2.FF_Furni_Club_member__c = NULL LIMIT :recordToDisplay OFFSET :(pageNumber - 1) * recordToDisplay]) {
                priceBooks.add(priceBook);
            }
            responseWrapper.pricebooks = priceBooks;
            responseWrapper.totalRecords = priceBooks.size();
            return responseWrapper;
        } catch (Exception exc) {
            throw new AuraHandledException(System.Label.FF_Cannot_retrieve_discount_list + ' ' + System.Label.FF_Error + ' ' + exc.getMessage());
        }
    }

    @AuraEnabled
    public static List<PriceBookEntryWrapper> getStandardPricebookEntries() {
        List<PriceBookEntryWrapper> pricebookEntries = new List<PriceBookEntryWrapper>();
        String standardPricebookId = [SELECT Id,IsActive,IsStandard FROM Pricebook2 WHERE IsStandard = true AND IsActive = true].Id;
        for (PricebookEntry entry : [SELECT Id,UnitPrice,IsActive,Name,Product2Id,Product2.Name,Product2.Product_Name_Link__c,Discount__c FROM PricebookEntry WHERE Pricebook2Id = :standardPricebookId ORDER BY Product2.Name]) {
            PriceBookEntryWrapper wrapper = new PriceBookEntryWrapper();
            wrapper.entry = entry;
            pricebookEntries.add(wrapper);
        }
        return pricebookEntries;
    }

    @AuraEnabled
    public static List<PriceBookEntryWrapper> getEntriesForEdit(String pricebookId) {
        List<PriceBookEntryWrapper> pricebookEntries = new List<PriceBookEntryWrapper>();
        Map<Id, Decimal> discountProductsMap = new Map<Id, Decimal>();
        Set<Id> discountProductIds = new Set<Id>();
        for (PricebookEntry discountEntry : [SELECT Id,UnitPrice,IsActive,Name,Product2Id,Product2.Name,Discount__c FROM PricebookEntry WHERE Pricebook2Id = :pricebookId]) {
            discountProductIds.add(discountEntry.Product2Id);
            discountProductsMap.put(discountEntry.Product2Id, discountEntry.Discount__c);
        }
        for (PricebookEntry entry : [SELECT Id,UnitPrice,IsActive,Name,Product2Id,Product2.Name,Product2.Product_Name_Link__c FROM PricebookEntry WHERE Pricebook2.IsStandard = true ORDER BY Product2.Name]) {
            PriceBookEntryWrapper wrapper = new PriceBookEntryWrapper();
            wrapper.entry = entry;
            if (discountProductsMap.keySet().contains(entry.Product2Id)) {
                wrapper.checked = true;
                wrapper.entry.Discount__c = discountProductsMap.get(entry.Product2Id);
            }
            pricebookEntries.add(wrapper);
        }
        return pricebookEntries;
    }

    @AuraEnabled
    public static List<PriceBookEntryWrapper> getEntriesForView(String pricebookId) {
        List<PriceBookEntryWrapper> pricebookEntries = new List<PriceBookEntryWrapper>();
        Set<Id> standardEntryIds = new Set<Id>();
        for (PricebookEntry entry : [SELECT Id,UnitPrice,IsActive,Name,Product2Id,Product2.Name,Product2.Product_Name_Link__c FROM PricebookEntry WHERE Pricebook2.IsStandard = true]) {
            standardEntryIds.add(entry.Product2Id);
        }
        for (PricebookEntry discountEntry : [SELECT Id,UnitPrice,IsActive,Name,Product2Id,Product2.Name,Discount__c,Product2.Product_Name_Link__c FROM PricebookEntry WHERE Pricebook2Id = :pricebookId ORDER BY Product2.Name]) {
            PriceBookEntryWrapper wrapper = new PriceBookEntryWrapper();
            wrapper.entry = discountEntry;
            if (standardEntryIds.contains(discountEntry.Product2Id)) {
                pricebookEntries.add(wrapper);
            }
        }
        return pricebookEntries;
    }

    @AuraEnabled
    public static void savePriceBookEntries(List<PriceBookEntryWrapper> wrappers, String priceBookId, Integer discount, Boolean isActive) {
        List<PricebookEntry> newEntries = new List<PricebookEntry>();
        List<String> duplicateEntries = new List<String>();
        List<Id> currentEntryProductIds = new List<Id>();
        for (PricebookEntry currentEntry : [SELECT Id,UnitPrice,IsActive,Product2Id,Discount__c FROM PricebookEntry WHERE Pricebook2.IsStandard = false AND IsActive = true]) {
            currentEntryProductIds.add(currentEntry.Product2Id);
        }
        try {
            for (PriceBookEntryWrapper wrapper : wrappers) {
                if (wrapper.checked) {
                    PricebookEntry newEntry = new PricebookEntry();
                    newEntry.UnitPrice = wrapper.entry.UnitPrice * (100 - wrapper.entry.Discount__c) / 100;
                    newEntry.Product2Id = wrapper.entry.Product2Id;
                    newEntry.Discount__c = wrapper.entry.Discount__c;
                    newEntry.Pricebook2Id = priceBookId;
                    newEntry.IsActive = isActive;
                    newEntries.add(newEntry);
                }
            }
            insert newEntries;
        } catch (Exception exc) {
            throw new AuraHandledException(System.Label.FF_Cannot_create_discount + ': ' + exc.getMessage());
        }
    }

    @AuraEnabled
    public static void updatePriceBookEntries(List<PriceBookEntryWrapper> wrappers, String priceBookId, Integer discount, Boolean isActive) {
        List<PricebookEntry> pricebookEntries = [SELECT Id FROM PricebookEntry WHERE Pricebook2Id = :priceBookId];
        delete pricebookEntries;
        savePriceBookEntries(wrappers, priceBookId, discount, isActive);
    }

    @AuraEnabled
    public static void togglePriceBookActive(String pricebookId, Boolean isActive) {
        Pricebook2 pricebook = [SELECT Id,IsActive FROM Pricebook2 WHERE Id = :pricebookId];
        List<PricebookEntry> entries = [SELECT Id,IsActive,Product2Id,Product2.Name,Discount__c FROM PricebookEntry WHERE Pricebook2Id = :pricebookId];
        List<String> duplicateEntries = new List<String>();
        List<Id> currentEntryProductIds = new List<Id>();
        for (PricebookEntry currentEntry : [SELECT Id,UnitPrice,IsActive,Product2Id,Discount__c FROM PricebookEntry WHERE Pricebook2.IsStandard = false AND IsActive = true]) {
            currentEntryProductIds.add(currentEntry.Product2Id);
        }
        try {
            if (isActive) {
                pricebook.IsActive = false;
                for (PricebookEntry entry : entries) {
                    entry.IsActive = false;
                }
                upsert pricebook;
                upsert entries;
            } else {
                for (PricebookEntry entry : entries) {
                    if (!currentEntryProductIds.contains(entry.Product2Id)) {
                        entry.IsActive = true;
                    } else {
                        duplicateEntries.add(entry.Product2.Name);
                    }
                }
                pricebook.IsActive = true;
                upsert pricebook;
                upsert entries;
            }
        } catch (Exception exc) {
            throw new AuraHandledException(exc.getMessage());
        }
    }

    public class ResponseWrapper {
        @AuraEnabled public Integer recordToDisplay { get; set; }
        @AuraEnabled public Integer pageNumber { get; set; }
        @AuraEnabled public Integer totalRecords { get; set; }
        @AuraEnabled public List<Pricebook2> pricebooks { get; set; }

        public ResponseWrapper() {
            pricebooks = new List<Pricebook2>();
        }
    }

    public class PriceBookEntryWrapper {
        @AuraEnabled public Boolean checked { get; set; }
        @AuraEnabled public PricebookEntry entry { get; set; }

        public PriceBookEntryWrapper() {
            checked = false;
        }
    }

}