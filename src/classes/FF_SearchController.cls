public with sharing class FF_SearchController {

    @AuraEnabled(cacheable = true)
    public static ProductSearchResponse getProductList(String query, Integer pageNumber, Integer recordsPerPage, String recordType, String productFamily){
        ProductSearchResponse productSearchResponse = new ProductSearchResponse();
        productSearchResponse.pageNumber = pageNumber;
        String totalRecordsQuery = prepareQueryString(query,recordType,productFamily,pageNumber,recordsPerPage);
        productSearchResponse.totalRecords = Database.query(totalRecordsQuery).size();
        String queryString = prepareQueryString(query,recordType,productFamily,pageNumber,recordsPerPage);
        queryString += ' LIMIT ' + recordsPerPage + ' OFFSET ' + ((pageNumber - 1) * recordsPerPage);
        productSearchResponse.records = Database.query(queryString);
        productSearchResponse.totalPages = Integer.valueOf(Math.ceil((Decimal)productSearchResponse.totalRecords/(Decimal)recordsPerPage));
        return productSearchResponse;
    }

    @AuraEnabled(cacheable = true)
    public static String getContentVersionIdForMainProductImage(String productId){
        Set<Id> linkIds = new Set<Id>();
        for(ContentDocumentLink link : [SELECT Id,LinkedEntityId,ContentDocumentId FROM ContentDocumentLink WHERE LinkedEntityId = :productId]){
            linkIds.add(link.ContentDocumentId);
        }
        return [SELECT Id,Title,ContentDocumentId,PathOnClient FROM ContentVersion WHERE Title = 'main' AND ContentDocumentId IN :linkIds LIMIT 1].Id;
    }

    private static String prepareQueryString(String name,String recordType,String productFamily, Integer pageNumber, Integer recordsPerPage){
        String queryString = 'SELECT Id,Name,ProductCode,Description,Family,RecordTypeId FROM Product2 ';
        List<String> params = new List<String>();
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
        queryString += ' ORDER BY Name ';
        System.debug('recordsPerPage: ' + recordsPerPage);
        System.debug('pageNumber: ' + pageNumber);

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