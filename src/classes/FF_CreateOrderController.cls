public without sharing class FF_CreateOrderController {

    @AuraEnabled
    public static Opportunity getOpportunity(String opportunityId){
        return [SELECT Id,Name,ContactId,FF_Billing_city__c,FF_Billing_country__c,FF_Billing_postal_code__c,FF_Billing_street__c,FF_Billing_state__c,FF_Invoice__c,FF_Tax_number__c,FF_Company__c,FF_Delivery__c,FF_Payment__c,FF_Shipping_city__c,FF_Shipping_country__c,FF_Shipping_postal_code__c,FF_Shipping_state__c,FF_Shipping_street__c FROM Opportunity WHERE Id = :opportunityId];
    }

    @AuraEnabled
    public static FF_CacheController.Basket checkAndReturnBasket(){
        String userId = UserInfo.getUserId();
        List<Opportunity> usersOpportunities = [SELECT Id FROM Opportunity WHERE CreatedById = :userId AND (NOT StageName LIKE '%Closed%')];
        FF_CacheController.Basket basket = new FF_CacheController.Basket();
        String opportunityId = '';
        try{
            if(usersOpportunities.isEmpty()){
                Opportunity newOpportunity = new Opportunity();
                newOpportunity.CloseDate = System.today();
                newOpportunity.Name = UserInfo.getName() + ' ' + String.valueOf(newOpportunity.CloseDate) + ' opportunity';
                newOpportunity.StageName = 'Collecting items';
                newOpportunity.Pricebook2Id = [SELECT Id,Name,IsActive FROM PriceBook2 WHERE IsStandard = true LIMIT 1].Id;
                newOpportunity.ContactId = [SELECT Id FROM Contact WHERE Email = :UserInfo.getUserEmail()].Id;
                insert newOpportunity;
                opportunityId = newOpportunity.Id;
            }else{
                opportunityId = usersOpportunities[0].Id;
            }
            basket = getBasketCache();
            if(basket!=null){
                basket.opportunityId = opportunityId;
            }

            saveOpportunityLineItems(basket);

            return basket;
        }catch (Exception exc){
            throw new AuraHandledException(System.Label.FF_Could_not_retrieve_basket);
        }
    }

    @AuraEnabled
    public static Boolean checkIfCreditCard(String opportunityId){
        Opportunity opportunityToCheck = getOpportunity(opportunityId);
        Boolean result = false;
        if(opportunityToCheck.FF_Payment__c=='Debit card'){
            result = true;
        }
        return result;
    }

    private static void saveOpportunityLineItems(FF_CacheController.Basket basket){
        List<OpportunityLineItem> currentItems = [SELECT Id FROM OpportunityLineItem WHERE OpportunityId = :basket.opportunityId];
        if(!currentItems.isEmpty()){
            delete currentItems;
        }
        List<OpportunityLineItem> updatedItems = new List<OpportunityLineItem>();
        for(FF_CacheController.ProductWrapper productWrapper : basket.productWrappers){
            OpportunityLineItem lineItem = new OpportunityLineItem();
            lineItem.OpportunityId = basket.opportunityId;
            lineItem.Product2Id = productWrapper.productId;
            lineItem.UnitPrice = productWrapper.unitPrice;
            lineItem.Quantity = productWrapper.quantity;
            updatedItems.add(lineItem);
        }
        insert updatedItems;
    }

    private static Decimal returnCurrentPrice(String productId){
        List<PricebookEntry> entries = [SELECT Id,UnitPrice,IsActive FROM PricebookEntry WHERE IsActive = true AND Product2Id = :productId ORDER BY UnitPrice ASC];
        Decimal price = entries[0].UnitPrice;
        if(entries.size()>1){
            price = entries[1].UnitPrice;
        }
        return price;
    }

    @AuraEnabled
    public static FF_CacheController.Basket getBasketCache(){
        Cache.SessionPartition  shoppingCartCache = Cache.Session.getPartition('ShoppingCartCache');
        String basketJson = (String)shoppingCartCache.get('basket');
        FF_CacheController.Basket currentBasket = null;
        if(String.isNotEmpty(basketJson)){
            currentBasket = (FF_CacheController.Basket)JSON.deserialize(basketJson,FF_CacheController.Basket.class);
        }
        return currentBasket;
    }

    private static void clearBasket(){
        Cache.SessionPartition shoppingCartCache = Cache.Session.getPartition('ShoppingCartCache');
        shoppingCartCache.put('basket','');
    }

    @AuraEnabled
    public static void saveOpportunity(Opportunity opportunityToSave){
        try{
            upsert opportunityToSave;
        }catch(Exception exc){
            throw new AuraHandledException(System.Label.FF_Invalid_data_please_review_your_information);
        }
    }

    @AuraEnabled
    public static void createOrder(String opportunityId,String contactId){
        try{
            Order newOrder = FF_OpportunityToOrderService.createOrderFromOpportunity(opportunityId,'customer','Accepted unpaid',contactId);
            FF_OpportunityToOrderService.createInvoiceForOrder(newOrder,14);
            clearBasket();
        }catch (DmlException exc){
            throw new AuraHandledException(exc.getDmlMessage(0));
        }
        catch (Exception exc){
            throw new AuraHandledException(System.Label.FF_Cannot_create_order_review_information_provided + ': ' + exc.getMessage());
        }
    }

    @AuraEnabled
    public static void saveAddressToContact(String street, String postal, String city, String country, String state){
        Contact userContact = [SELECT Id FROM Contact WHERE Email = :UserInfo.getUserEmail()];
        userContact.MailingStreet = street;
        userContact.MailingPostalCode = postal;
        userContact.MailingCity = city;
        userContact.MailingCountry = country;
        userContact.MailingState = state;
        try{
            upsert userContact;
        }catch(Exception exc){
            throw new AuraHandledException(System.Label.FF_Invalid_data_please_review_your_information);
        }

    }

    @AuraEnabled
    public static void recalculateProductWrappers(List<FF_CacheController.ProductWrapper> wrappers, String opportunityId){
        for(FF_CacheController.ProductWrapper productWrapper : wrappers){
            recalculateLineItems(productWrapper.productId,opportunityId,productWrapper.quantity);
        }

    }

    @AuraEnabled
    public static FF_CacheController.Basket recalculateLineItems(String productId, String opportunityId, Integer quantity){
        OpportunityLineItem lineItem = [SELECT Id,UnitPrice,TotalPrice,ListPrice,OpportunityId,Product2Id,Quantity FROM OpportunityLineItem WHERE OpportunityId = :opportunityId AND Product2Id = :productId];
        try{
            lineItem.Quantity = quantity;
            if(quantity>0){
                upsert lineItem;
            }else{
                delete lineItem;
            }
        }catch (Exception exc){
            throw new AuraHandledException(System.Label.FF_Could_not_calculate_basket);
        }

        FF_CacheController.Basket basket = updateBasket(opportunityId);

        Cache.SessionPartition shoppingCartCache = Cache.Session.getPartition('ShoppingCartCache');
        shoppingCartCache.put('basket',JSON.serialize(basket));

        return basket;
    }

    @AuraEnabled
    public static FF_CacheController.Basket getBasketFromOpportunity(String opportunityId){
        FF_CacheController.Basket basket = new FF_CacheController.Basket();
        List<OpportunityLineItem> lineItems = [SELECT Id,Name,Product2.Name,Product2Id,UnitPrice,Quantity,TotalPrice,ListPrice FROM OpportunityLineItem WHERE OpportunityId=:opportunityId];
        if(!lineItems.isEmpty()){
            for(OpportunityLineItem lineItem : lineItems){
                FF_CacheController.ProductWrapper productWrapper = new FF_CacheController.ProductWrapper();
                productWrapper.productId = lineItem.Product2Id;
                productWrapper.quantity = Integer.valueOf(lineItem.Quantity);
                productWrapper.unitPrice = lineItem.UnitPrice;
                productWrapper.price = lineItem.TotalPrice;
                productWrapper.name = lineItem.Product2.Name;
                basket.productWrappers.add(productWrapper);
            }
        }
        basket.opportunityId = opportunityId;
        return basket;
    }

    @AuraEnabled
    public static void deleteLineItems(String[] lineItemsIds, String opportunityId){
        List<OpportunityLineItem> lineItemsToDelete = [SELECT Id FROM OpportunityLineItem WHERE OpportunityId = :opportunityId AND Product2Id IN :lineItemsIds];
        delete lineItemsToDelete;
    }

    @AuraEnabled
    public static String retrieveBankUrl(){
        return [SELECT Bank_url__c FROM Product_Setting__mdt].Bank_url__c;
    }

    private static FF_CacheController.Basket calculateBasket(FF_CacheController.Basket basket){
        basket.totalQuantity=0;
        basket.totalPrice=0;
        for(FF_CacheController.ProductWrapper productWrapper : basket.productWrappers){
            if(productWrapper.quantity>0){
                basket.totalQuantity += productWrapper.quantity;
                basket.totalPrice += productWrapper.price;
            }
        }
        return basket;
    }

    private static FF_CacheController.Basket updateBasket(String opportunityId){
        FF_CacheController.Basket basket = new FF_CacheController.Basket();
        List<OpportunityLineItem> lineItems = [SELECT Id,Name,Product2.Name,Product2Id,UnitPrice,Quantity,TotalPrice,ListPrice FROM OpportunityLineItem WHERE OpportunityId=:opportunityId];
        if(!lineItems.isEmpty()){
            for(OpportunityLineItem lineItemIter : lineItems){
                FF_CacheController.ProductWrapper productWrapper = new FF_CacheController.ProductWrapper();
                productWrapper.productId = lineItemIter.Product2Id;
                productWrapper.quantity = Integer.valueOf(lineItemIter.Quantity);
                productWrapper.unitPrice = lineItemIter.UnitPrice;
                productWrapper.price = lineItemIter.TotalPrice;
                productWrapper.name = lineItemIter.Product2.Name;
                basket.productWrappers.add(productWrapper);
            }
        }
        basket.opportunityId = opportunityId;
        basket = calculateBasket(basket);
        return basket;
    }

}