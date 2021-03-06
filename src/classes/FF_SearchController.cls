public without sharing class FF_SearchController {

    @AuraEnabled(cacheable = true)
    public static ProductSearchResponse getProductList(String query, Integer pageNumber, Integer recordsPerPage, String recordType, String productFamily){
        ProductSearchResponse productSearchResponse = new ProductSearchResponse();
        String totalRecordsQuery = prepareQueryString(query,recordType,productFamily,pageNumber,recordsPerPage);
        String queryString = prepareQueryString(query,recordType,productFamily,pageNumber,recordsPerPage);
        queryString += ' LIMIT ' + recordsPerPage + ' OFFSET ' + ((pageNumber - 1) * recordsPerPage);
        productSearchResponse.pageNumber = pageNumber;
        try{
            productSearchResponse.totalRecords = Database.query(totalRecordsQuery).size();
            productSearchResponse.records = Database.query(queryString);
            productSearchResponse.totalPages = Integer.valueOf(Math.ceil((Decimal)productSearchResponse.totalRecords/(Decimal)recordsPerPage));
            return productSearchResponse;
        }catch (Exception exc){
            throw new AuraHandledException(System.Label.FF_Cannot_search_products + ' ' + System.Label.FF_Error + ' ' + exc.getMessage());
        }
    }

    @AuraEnabled(cacheable = true)
    public static String getContentVersionIdForMainProductImage(String productId){
        Set<Id> linkIds = new Set<Id>();
        List<ContentVersion> mainImageCvList = new List<ContentVersion>();
        try{
            for(ContentDocumentLink link : [SELECT Id,LinkedEntityId,ContentDocumentId FROM ContentDocumentLink WHERE LinkedEntityId = :productId]){
                linkIds.add(link.ContentDocumentId);
            }
            for(ContentVersion mainImageCv : [SELECT Id,Title,ContentDocumentId,PathOnClient FROM ContentVersion WHERE Title = 'main' AND ContentDocumentId IN :linkIds LIMIT 1]){
                if(mainImageCv!=null){
                    mainImageCvList.add(mainImageCv);
                }
            }
            if(!mainImageCvList.isEmpty()){
                return mainImageCvList[0].Id;
            }else{
                return null;
            }
        }catch (Exception exc){
            throw new AuraHandledException(System.Label.FF_Cannot_get_product_image_info + ' ' + System.Label.FF_Error + ' ' + exc.getMessage());
        }
    }

    @AuraEnabled(cacheable = true)
    public static List<PricebookEntry> getPriceBookEntry(String productId){
        List<PricebookEntry> entries = new List<PricebookEntry>();
        List<PricebookEntry> discountEntries = new List<PricebookEntry>();
        if(UserInfo.getName() != 'Furni Future Community Page Site Guest User'){
            Contact userContact = [SELECT Id,Email FROM Contact WHERE Email = :UserInfo.getUserEmail()];
            entries = [SELECT Id,UnitPrice,IsActive FROM PricebookEntry WHERE IsActive = true AND Product2Id = :productId AND (Pricebook2.FF_Furni_Club_member__c = NULL OR Pricebook2.FF_Furni_Club_member__c = :userContact.Id) ORDER BY UnitPrice ASC];
        }else{
            entries = [SELECT Id,UnitPrice,IsActive FROM PricebookEntry WHERE IsActive = true AND Product2Id = :productId AND Pricebook2.FF_Furni_Club_member__c = NULL ORDER BY UnitPrice ASC];
        }
        if(entries.size()>1){
            discountEntries.add(entries[0]);
            discountEntries.add(entries[entries.size()-1]);
        }else{
            discountEntries.add(entries[0]);
        }
        return discountEntries;
    }

    private static String prepareQueryString(String name,String recordType,String productFamily, Integer pageNumber, Integer recordsPerPage){
        String queryString = 'SELECT Id,Name,ProductCode,Description,Family,RecordTypeId FROM Product2 ';
        List<String> params = new List<String>();
        params.add('IsActive = true');
        if(String.isNotBlank(name)){
            params.add('Name LIKE \'%' + String.escapeSingleQuotes(name) + '%\'');
        }
        if(String.isNotBlank(recordType)){
            params.add('RecordType.Name = \'' + String.escapeSingleQuotes(recordType) + '\'');
        }
        if(String.isNotBlank(productFamily)){
            params.add('Family = \'' + String.escapeSingleQuotes(productFamily) + '\'');
        }

        if (!params.isEmpty()) {
            queryString += ' WHERE ';
            queryString += String.join(params, ' AND ');
        }
        queryString += ' ORDER BY CreatedDate DESC ';
        return queryString;
    }

    public class ProductSearchResponse {
        @AuraEnabled public Integer pageNumber {get;set;}
        @AuraEnabled public Integer totalPages {get;set;}
        @AuraEnabled public Integer totalRecords {get;set;}
        @AuraEnabled public List<Product2> records {get;set;}

        public ProductSearchResponse(){
            records = new List<Product2>();
        }
    }
}