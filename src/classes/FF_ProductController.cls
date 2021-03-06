public with sharing class FF_ProductController {

    @AuraEnabled
    public static ProductWrapper getProduct(Integer pageNumber ,Integer recordToDisplay) {
        ProductWrapper productWrapper = new ProductWrapper();
        productWrapper.recordToDisplay = recordToDisplay;
        productWrapper.pageNumber = pageNumber;
        try{
            AggregateResult[] groupedResults  = [SELECT count(Id)cnt FROM Product2];
            productWrapper.totalRecords = Integer.valueof(groupedResults[0].get('cnt'));
            Map<Id,PricebookEntry> productPrices = new Map<Id, PricebookEntry>();
            for(PricebookEntry entry : [SELECT Id,UnitPrice,Product2Id FROM PricebookEntry WHERE Pricebook2.IsStandard = true]){
                productPrices.put(entry.Product2Id,entry);
            }
            for(Product2 product : [SELECT Id,Name,ProductCode,Description,Family,Product_Name_Link__c,RecordType.Name,FF_Storage_size__c FROM Product2 ORDER BY Name LIMIT :recordToDisplay OFFSET :(pageNumber - 1) * recordToDisplay]){
                productWrapper.ProductListToDisplay.add(new ProductWithPrice(product,productPrices.get(product.Id).UnitPrice));
            }
            System.debug(productWrapper);
            return productWrapper;
        }catch (Exception exc){
            throw new AuraHandledException(System.Label.FF_Cannot_retrieve_product_list + ' ' + System.Label.FF_Error + ' ' + exc.getMessage());
        }
    }

    @AuraEnabled
    public static List<String> getRecentProducts() {
        List<String> latestProducts = new List<String>();
        Set<Id> latestProductsIds = new Set<Id>();
        try{
            for(RecentlyViewed recent : [SELECT Id,Name,Type,LastViewedDate FROM RecentlyViewed WHERE Type = 'Product2' ORDER BY LastViewedDate DESC LIMIT 10]){
                    latestProducts.add(recent.Id);
            }
            return latestProducts;
        }catch (Exception exc){
            throw new AuraHandledException(System.Label.FF_Cannot_retrieve_product_list + ' ' + System.Label.FF_Error + ' ' + exc.getMessage());
        }
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
    public static PricebookEntry getStandardPriceBookEntry(String productId){
        return [SELECT Id,UnitPrice,Product2Id FROM PricebookEntry WHERE Pricebook2.IsStandard = true AND Product2Id = :productId];
    }

    @AuraEnabled
    public static void saveStandardPricebookEntry(PricebookEntry pricebookEntry){
        List<PricebookEntry> entriesToUpdate = new List<PricebookEntry>();
        for(PricebookEntry currentEntry : [SELECT Id,Name,Pricebook2.Name,UnitPrice,Discount__c FROM PricebookEntry WHERE Pricebook2.IsStandard = false AND Product2Id = :pricebookEntry.Product2Id]){
            System.debug(currentEntry);
            currentEntry.UnitPrice = pricebookEntry.UnitPrice * (100-currentEntry.Discount__c) / 100;
            entriesToUpdate.add(currentEntry);
        }
        upsert pricebookEntry;
        upsert entriesToUpdate;
    }

    @AuraEnabled
    public static void createStandardPricebookEntry(String productId, Decimal productPrice){
        PricebookEntry entry = new PricebookEntry();
        entry.Product2Id = productId;
        entry.UnitPrice = productPrice;
        entry.Pricebook2Id = [SELECT Id FROM Pricebook2 WHERE IsStandard = true].Id;
        insert entry;
    }

    @AuraEnabled
    public static List<OrderItemWrapper> getOrderProducts(String orderId){
        List<OrderItemWrapper> orderItems = new List<OrderItemWrapper>();
        for(OrderItem orderItem : [SELECT Id,Product2.Name,Quantity,UnitPrice,TotalPrice FROM OrderItem WHERE OrderId = :orderId]){
            orderItems.add(new OrderItemWrapper(orderItem.Product2.Name,Integer.valueOf(orderItem.Quantity),orderItem.UnitPrice,orderItem.TotalPrice));
        }
        return orderItems;
    }

    @AuraEnabled
    public static Boolean checkIfAdmin(){
        Set<Id> adminsIds = new Set<Id>();
        for(Profile profile : [SELECT Id FROM Profile WHERE Name = 'System Administrator']){
            if(String.isNotEmpty(profile.Id)){
                adminsIds.add(profile.Id);
            }
        }
        return adminsIds.contains(UserInfo.getProfileId()) ? true : false;
    }

    @AuraEnabled
    public static void createProductApproval(String productId){
        try{
            Approval.ProcessSubmitRequest psr = new Approval.ProcessSubmitRequest();
            psr.setObjectId(productId);
            psr.setProcessDefinitionNameOrId('Product_add_approval');
            Approval.ProcessResult result = Approval.process(psr);
        }catch(Exception exc){
            throw new AuraHandledException(System.Label.FF_Cannot_send_to_approval);
        }
    }

    @AuraEnabled
    public static Boolean checkIfLocked(String productId){
        Boolean isLocked = false;
        if(!checkIfAdmin()){
            isLocked = Approval.isLocked(productId);
        }
        return isLocked;
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
        ContentVersion contentVers = new ContentVersion();
        contentVers.ContentLocation = 'S';
        contentVers.PathOnClient = fileWrapper.fileName;
        if(fileWrapper.isMain==true){
            contentVers.Title = 'main';
        }else{
            contentVers.Title = 'detail';
        }
        ContentDocumentLink contentLink = new ContentDocumentLink();
        contentLink.ShareType = 'I';
        contentLink.Visibility = 'AllUsers';
        try{
            contentVers.VersionData = EncodingUtil.base64Decode(fileWrapper.fileBody);
            String existingMain = getMainPicture(productId);
            if(contentVers.Title=='main' && existingMain!=null){
                ContentVersion contentVersion = [SELECT Id,Title FROM ContentVersion WHERE Id = :existingMain];
                contentVersion.Title = 'detail';
                update contentVersion;
            }
            insert contentVers;

            Id contentDocId = [SELECT ContentDocumentId FROM ContentVersion WHERE Id =:contentVers.Id].ContentDocumentId;

            contentLink.ContentDocumentId = contentDocId;
            contentLink.LinkedEntityId = productId;

            insert contentLink;
        }catch (Exception exc){
            throw new AuraHandledException(System.Label.FF_Cannot_save_file + ' ' + System.Label.FF_Error + ' ' + exc.getMessage());
        }
    }

    @AuraEnabled
    public static void deletePhoto(String documentId){
        try{
            ContentDocument photo = [SELECT Id,Title FROM ContentDocument WHERE Id = :documentId];
            delete photo;
        }catch (Exception exc){
            throw new AuraHandledException(System.Label.FF_Problem_deleting_image + ' ' + System.Label.FF_Error + ' ' + exc.getMessage());
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
            throw new AuraHandledException(System.Label.FF_Cannot_get_main_image_info + ' ' + System.Label.FF_Error + ' ' + exc.getMessage());
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
            throw new AuraHandledException(System.Label.FF_Cannot_get_detail_images_info + ' ' + System.Label.FF_Error + ' ' + exc.getMessage());
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
            throw new AuraHandledException(System.Label.FF_Cannot_fetch_current_images + ' ' + System.Label.FF_Error + ' ' + exc.getMessage());
        }
    }

    @AuraEnabled
    public static List<String> getFileLinks(String productId){
        List<String> links = new List<String>();
        Set<Id> documentIds = new Set<Id>();
        String suffix = [SELECT DeveloperName,ContentVersion_preview_url__c FROM Product_Setting__mdt].ContentVersion_preview_url__c;
        try{
            for(ContentDocumentLink link : [SELECT ContentDocumentId FROM ContentDocumentLink WHERE LinkedEntityId = :productId]){
                documentIds.add(link.ContentDocumentId);
            }
            for(ContentVersion contentVersion : [SELECT Id,Title,ContentDocumentId FROM ContentVersion WHERE Title = 'detail' AND ContentDocumentId IN :documentIds]){
                links.add(suffix + contentVersion.Id);
            }
            return links;
        }catch (Exception exc){
            throw new AuraHandledException(System.Label.FF_Error_receiving_file_urls + ' ' + System.Label.FF_Error + ' ' + exc.getMessage());
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
            throw new AuraHandledException(System.Label.FF_Problem_setting_main_image + ' ' + System.Label.FF_Error + ' ' + exc.getMessage());
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
            throw new AuraHandledException(System.Label.FF_Cannot_delete_files + ' ' + System.Label.FF_Error + ' ' + exc.getMessage());
        }
    }

    @AuraEnabled
    public static String queryImageLinkSuffix(){
        return [SELECT DeveloperName,ContentVersion_preview_url__c FROM Product_Setting__mdt].ContentVersion_preview_url__c;
    }

    public class OrderItemWrapper {
        @AuraEnabled public String productName {get;set;}
        @AuraEnabled public Integer quantity {get;set;}
        @AuraEnabled public Decimal unitPrice {get;set;}
        @AuraEnabled public Decimal totalPrice {get;set;}

        public OrderItemWrapper(String productName,Integer quantity,Decimal unitPrice,Decimal totalPrice){
            this.productName = productName;
            this.quantity = quantity;
            this.unitPrice = unitPrice;
            this.totalPrice = totalPrice;
        }
    }

    public class ProductWrapper {
        @AuraEnabled public Integer recordToDisplay {get;set;}
        @AuraEnabled public Integer pageNumber {get;set;}
        @AuraEnabled public Integer totalRecords {get;set;}
        @AuraEnabled public List<ProductWithPrice> ProductListToDisplay {get;set;}

        public ProductWrapper(){
            ProductListToDisplay = new List<ProductWithPrice>();
        }
    }

    public class ProductWithPrice {
        @AuraEnabled public Product2 product {get;set;}
        @AuraEnabled public Decimal price {get;set;}
        @AuraEnabled public String productName {get;set;}
        @AuraEnabled public String productNameLink {get;set;}
        @AuraEnabled public String recordTypeName {get;set;}
        @AuraEnabled public String productFamily {get;set;}
        @AuraEnabled public Integer storageSize {get;set;}

        public ProductWithPrice(Product2 product, Decimal price){
            this.product = product;
            this.price = price;
            productName = product.Name;
            productNameLink = product.Product_Name_Link__c;
            recordTypeName = product.RecordType.Name;
            productFamily = product.Family;
            storageSize = Integer.valueOf(product.FF_Storage_size__c);
        }
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