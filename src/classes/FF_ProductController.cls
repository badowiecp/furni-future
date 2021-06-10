public with sharing class FF_ProductController {

    @AuraEnabled
    public static ProductWrapper getProduct(Integer pageNumber ,Integer recordToDisplay) {
        ProductWrapper productWrapper = new ProductWrapper();
        productWrapper.recordToDisplay = recordToDisplay;
        productWrapper.pageNumber = pageNumber;
        try{
            AggregateResult[] groupedResults  = [SELECT count(Id)cnt FROM Product2];
            productWrapper.totalRecords = Integer.valueof(groupedResults[0].get('cnt'));
            productWrapper.ProductListToDisplay = [SELECT Id,Name,ProductCode,Description,Family,Product_Name_Link__c,RecordType.Name FROM Product2 ORDER BY Name LIMIT :recordToDisplay OFFSET :(pageNumber - 1) * recordToDisplay];
            return productWrapper;
        }catch (Exception exc){
            throw new AuraHandledException('Cannot retrieve product list. Error: ' + exc.getMessage());
        }
    }

    @AuraEnabled
    public static String queryImageLinkSuffix(){
        return [SELECT DeveloperName,ContentVersion_preview_url__c FROM Product_Setting__mdt].ContentVersion_preview_url__c;
    }

    @AuraEnabled
    public static List<String> fetchRecordTypeValues(){
        List<Schema.RecordTypeInfo> recordtypes = Product2.SObjectType.getDescribe().getRecordTypeInfos();
        Map<Id,String> recordtypemap = new Map<Id, String>();
        for(RecordTypeInfo recordTypeInfo : recordtypes){
            if(recordTypeInfo.getName() != 'Master'){
                recordtypemap.put(recordTypeInfo.getRecordTypeId(), recordTypeInfo.getName());
            }
        }
        return recordtypemap.values();
    }

    @AuraEnabled
    public static Id getRecTypeId(String recordTypeLabel){
        Id recid = Schema.SObjectType.Product2.getRecordTypeInfosByName().get(recordTypeLabel).getRecordTypeId();
        return recid;
    }

    @AuraEnabled
    public static void saveDocuments(List<FileWrapper> files, String productId){
        for(FileWrapper file : files){
            saveDocument(productId,file);
        }
    }

    @AuraEnabled
    public static void saveDocument(String productId,FileWrapper fileWrapper){
        try{
            ContentVersion contentVers = new ContentVersion();
            contentVers.ContentLocation = 'S';
            contentVers.PathOnClient = fileWrapper.fileName;
            if(fileWrapper.isMain==true){
                contentVers.Title = 'main';
            }else{
                contentVers.Title = 'detail';
            }
            contentVers.VersionData = EncodingUtil.base64Decode(fileWrapper.fileBody);
            String existingMain = getMainPicture(productId);
            if(contentVers.Title=='main' && existingMain!=null){
                ContentVersion contentVersion = [SELECT Id,Title FROM ContentVersion WHERE Id = :existingMain];
                contentVersion.Title = 'detail';
                update contentVersion;
            }
            insert contentVers;

            Id contentDocId = [SELECT ContentDocumentId FROM ContentVersion WHERE Id =:contentVers.Id].ContentDocumentId;

            ContentDocumentLink contentLink = new ContentDocumentLink();
            contentLink.ContentDocumentId = contentDocId;
            contentLink.LinkedEntityId = productId;
            contentLink.ShareType = 'I';
            contentLink.Visibility = 'AllUsers';
            insert contentLink;
        }catch (Exception exc){
            throw new AuraHandledException('Cannot save file. Error: ' + exc.getMessage());
        }
    }

    @AuraEnabled
    public static void deletePhoto(String documentId){
        try{
            ContentDocument photo = [SELECT Id,Title FROM ContentDocument WHERE Id = :documentId];
            delete photo;
        }catch (Exception exc){
            throw new AuraHandledException('Problem deleting image. Error: ' + exc.getMessage());
        }
    }

    @AuraEnabled
    public static String getMainPicture(String productId){
        Set<Id> documentIds = new Set<Id>();
        try{
            for(ContentDocumentLink link : [SELECT ContentDocumentId FROM ContentDocumentLink WHERE LinkedEntityId = :productId]){
                documentIds.add(link.ContentDocumentId);
            }
            String contentVersionId = null;
            List<ContentVersion> contentVersions = [SELECT Id,Title,ContentDocumentId FROM ContentVersion WHERE Title = 'main' AND ContentDocumentId IN :documentIds LIMIT 1];
            if(!contentVersions.isEmpty()){
                contentVersionId = contentVersions[0].Id;
            }
            return contentVersionId;
        }catch (Exception exc){
            throw new AuraHandledException('Cannot get main image info. Error: ' + exc.getMessage());
        }
    }

    @AuraEnabled
    public static List<ContentVersion> getDetailPictures(String productId){
        Set<Id> documentIds = new Set<Id>();
        try{
            for(ContentDocumentLink link : [SELECT ContentDocumentId FROM ContentDocumentLink WHERE LinkedEntityId = :productId AND ContentDocument.Title LIKE 'detail%']){
                documentIds.add(link.ContentDocumentId);
            }
            return [SELECT Id,Title,ContentDocumentId FROM ContentVersion WHERE ContentDocumentId IN :documentIds];
        }catch (Exception exc){
            throw new AuraHandledException('Cannot get detail images info. Error: ' + exc.getMessage());
        }
    }

    @AuraEnabled
    public static List<FileWrapper> getCurrentFileWrappers(String productId){
        List<FileWrapper> fileWrappers = new List<FileWrapper>();
        Set<Id> documentIds = new Set<Id>();
        try{
            for(ContentDocumentLink link : [SELECT ContentDocumentId FROM ContentDocumentLink WHERE LinkedEntityId = :productId]){
                documentIds.add(link.ContentDocumentId);
            }
            for(ContentVersion contentVersion : [SELECT Id,Title,ContentDocumentId FROM ContentVersion WHERE ContentDocumentId IN :documentIds]){
                fileWrappers.add(new FileWrapper(contentVersion.Title,contentVersion.Id));
            }
            return fileWrappers;
        }catch (Exception exc){
            throw new AuraHandledException('Cannot fetch current images. Error: ' + exc.getMessage());
        }
    }

    @AuraEnabled
    public static List<String> getFileLinks(String productId){
        List<String> links = new List<String>();
        Set<Id> documentIds = new Set<Id>();
        try{
            for(ContentDocumentLink link : [SELECT ContentDocumentId FROM ContentDocumentLink WHERE LinkedEntityId = :productId]){
                documentIds.add(link.ContentDocumentId);
            }
            for(ContentVersion contentVersion : [SELECT Id,Title,ContentDocumentId FROM ContentVersion WHERE Title = 'detail' AND ContentDocumentId IN :documentIds]){
                links.add('/sfc/servlet.shepherd/version/download/' + contentVersion.Id);
            }
            return links;
        }catch (Exception exc){
            throw new AuraHandledException('Error receiving file urls: ' + exc.getMessage());
        }
    }

    @AuraEnabled
    public static void setMainContentVersion(String productId, List<FileWrapper> files){
        Set<Id> documentIds = new Set<Id>();
        try{
            for(ContentDocumentLink link : [SELECT ContentDocumentId FROM ContentDocumentLink WHERE LinkedEntityId = :productId]){
                documentIds.add(link.ContentDocumentId);
            }

            List<ContentVersion> currentMain = [SELECT Id,Title,ContentDocumentId FROM ContentVersion WHERE Title = 'main' AND ContentDocumentId IN :documentIds LIMIT 1];
            for(FileWrapper fileWrapper : files){
                List<ContentVersion> newMain = [SELECT Id,Title FROM ContentVersion WHERE Id = :fileWrapper.contentVersionId];
                if(fileWrapper.isMain && currentMain.isEmpty()){
                    newMain[0].Title = 'main';
                    update newMain[0];
                }else if(fileWrapper.isMain && fileWrapper.contentVersionId!=currentMain[0].Id){
                    currentMain[0].Title = 'detail';
                    update currentMain[0];
                    newMain[0].Title = 'main';
                    update newMain[0];
                }
            }
        }catch (Exception exc){
            throw new AuraHandledException('Problem setting main image: ' + exc.getMessage());
        }
    }

    @AuraEnabled
    public static void deleteDocuments(List<String> contentVersionIds){
        Set<Id> documentIds = new Set<Id>();
        try{
            for(ContentVersion contentVersion : [SELECT ContentDocumentId FROM ContentVersion WHERE Id IN :contentVersionIds]){
                documentIds.add(contentVersion.ContentDocumentId);
            }
            delete [SELECT Id FROM ContentDocument WHERE Id IN: documentIds];
        }catch (Exception exc){
            throw new AuraHandledException('Cannot delete files. Error: ' + exc.getMessage());
        }
    }

    public class ProductWrapper {
        @AuraEnabled public Integer recordToDisplay {get;set;}
        @AuraEnabled public Integer pageNumber {get;set;}
        @AuraEnabled public Integer totalRecords {get;set;}
        @AuraEnabled public List<Product2> ProductListToDisplay {get;set;}
    }

    public class FileWrapper {
        @AuraEnabled public String fileName {get;set;}
        @AuraEnabled public String fileBody {get;set;}
        @AuraEnabled public String filePreview {get;set;}
        @AuraEnabled public String title {get;set;}
        @AuraEnabled public String contentVersionId {get;set;}
        @AuraEnabled public Boolean isMain {get;set;}

        public FileWrapper(){
        }

        public FileWrapper(String title, String contentVersionId){
            this.title = title;
            this.contentVersionId = contentVersionId;
            if(title=='main'){
                isMain = true;
            }else{
                isMain = false;
            }
        }
    }
}