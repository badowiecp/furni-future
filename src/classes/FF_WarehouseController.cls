public with sharing class FF_WarehouseController {

    @AuraEnabled(cacheable=true)
    public static List<FF_Warehouse__c> getWarehouses(String city, Integer capacity){
        List<FF_Warehouse__c> warehouses = new List<FF_Warehouse__c>();
        String queryString = prepareQuery(city,capacity);
        try{
            return Database.query(queryString);
        }catch (Exception exc){
            throw new AuraHandledException(System.Label.FF_Error_retrieving_warehouses_data);
        }
    }

    private static String prepareQuery(String city, Integer capacity){
        String queryString = 'SELECT Id,Name,FF_Street__c,FF_City__c,FF_Country__c,FF_Postal_code__c,FF_Location__Latitude__s,FF_Location__Longitude__s,FF_Storage_capacity__c FROM FF_Warehouse__c ';
        List<String> params = new List<String>();
        if(String.isNotBlank(city)){
            params.add('FF_City__c LIKE \'%' + String.escapeSingleQuotes(city) + '%\'');
        }
        if(capacity!=null){
            params.add('FF_Storage_capacity__c = ' + capacity);
        }

        if (!params.isEmpty()) {
            queryString += ' WHERE ';
            queryString += String.join(params, ' AND ');
        }
        return queryString;
    }

}