public with sharing class FF_PicklistController {
    private static FF_Product_Record_Type_Fetch_Setting__c setting {get{
        return FF_Product_Record_Type_Fetch_Setting__c.getOrgDefaults();
    }set;}
    private static final String clientId = setting.Client_Id__c;
    private static final String clientSecret = setting.Client_secret__c;
    private static final String login = setting.Login__c;
    private static final String password = setting.Password__c;

    @AuraEnabled
    public static List<String> getPickListValuesAsList(String objectType, String selectedField){
        List<String> pickListValuesList = new List<String>();
        Schema.SObjectType convertToObj = Schema.getGlobalDescribe().get(objectType);
        Schema.DescribeSObjectResult res = convertToObj.getDescribe();
        Schema.DescribeFieldResult fieldResult = res.fields.getMap().get(selectedField).getDescribe();
        System.debug(fieldResult);
        List<Schema.PicklistEntry> ple = fieldResult.getPicklistValues();
        System.debug(ple);
        for( Schema.PicklistEntry pickListVal : ple){
            pickListValuesList.add(pickListVal.getLabel());
        }
        System.debug(pickListValuesList);
        return pickListValuesList;
    }

    private class deserializeResponse {
        public String id;
        public String access_token;
        public String instance_url;
        public String token_type;
        public String issued_at;
        public String signature;
    }

    public static String returnAccessToken() {
        String endpoint = setting.Login_url__c + 'token?grant_type=password&client_id='
                + clientId + '&client_secret='
                + clientSecret + '&username='
                + login + '&password=' + password;
        HttpResponse httpResponse = sendRequest(endpoint,'POST',null,null);
        deserializeResponse response = (deserializeResponse) JSON.deserialize(httpResponse.getBody(), deserializeResponse.class);
        return response.access_token;
    }

    @AuraEnabled
    public static List<String> getPicklistForRecordType(String recordTypeId){
        List<String> values = new List<String>();
        String accessToken = returnAccessToken();
        if(accessToken!=null){
            String endpoint = 'https://britenet13-dev-ed.my.salesforce.com/services/data/v51.0/ui-api/object-info/Product2/picklist-values/' + recordTypeId + '/Family';
            HttpResponse httpResponse = sendRequest(endpoint,'GET',null,accessToken);
            RecordTypePicklistResponse picklistResponse = (RecordTypePicklistResponse) JSON.deserialize(httpResponse.getBody(),RecordTypePicklistResponse.class);
            if(picklistResponse.values!=null){
                for (PicklistOption option : picklistResponse.values){
                    values.add(option.label);
                }
            }
        }
        return values;
    }

    @AuraEnabled
    public static List<String> getPicklistForRecordTypeForEdit(String recordId){
        List<String> values = new List<String>();
        String recordTypeId = [SELECT Id,RecordTypeId FROM Product2 WHERE Id = :recordId].RecordTypeId;
        String accessToken = returnAccessToken();
        if(accessToken!=null){
            String endpoint = 'https://britenet13-dev-ed.my.salesforce.com/services/data/v51.0/ui-api/object-info/Product2/picklist-values/' + recordTypeId + '/Family';
            HttpResponse httpResponse = sendRequest(endpoint,'GET',null,accessToken);
            RecordTypePicklistResponse picklistResponse = (RecordTypePicklistResponse) JSON.deserialize(httpResponse.getBody(),RecordTypePicklistResponse.class);
            if(picklistResponse.values!=null){
                for (PicklistOption option : picklistResponse.values){
                    values.add(option.label);
                }
            }
        }
        return values;
    }

    public class RecordTypePicklistResponse {
        public List<PicklistOption> values {get;set;}
    }

    public class PicklistOption {
        public String value {get;set;}
        public String label {get;set;}
    }

    private static HttpResponse sendRequest(String endpoint,String method,String body,String accessToken){
        Http http = new Http();
        HttpRequest httpRequest = new HttpRequest();
        if(String.isNotBlank(accessToken)){
            httpRequest.setHeader('Authorization','Bearer ' + accessToken);
        }
        httpRequest.setHeader('Content-Type','application/json');
        httpRequest.setHeader('Accept','application/json');
        httpRequest.setEndpoint(endpoint);
        httpRequest.setMethod(method);
        if(String.isNotBlank(body)){
            httpRequest.setBody(body);
        }
        HttpResponse httpResponse = http.send(httpRequest);
        return httpResponse;
    }
}