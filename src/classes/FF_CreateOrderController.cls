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
        if(usersOpportunities.isEmpty()){
            Opportunity newOpportunity = new Opportunity();
            newOpportunity.CloseDate = System.today();
            newOpportunity.Name = UserInfo.getName() + ' ' + String.valueOf(newOpportunity.CloseDate) + ' opportunity';
            newOpportunity.StageName = 'Collecting items';
            newOpportunity.Pricebook2Id = '01s0900000B6HpHAAV';
            insert newOpportunity;
            opportunityId = newOpportunity.Id;
        }else{
            opportunityId = usersOpportunities[0].Id;
        }
        basket = getBasketCache();
        System.debug('Basket from cache: ' + basket);

        if(basket!=null){
            basket.opportunityId = opportunityId;
        }

        saveOpportunityLineItems(basket);
        Quote_event__e addQuoteEvent = new Quote_event__e();
        addQuoteEvent.Opportunity_Id__c = opportunityId;
        EventBus.publish(addQuoteEvent);
        return basket;
    }

    @AuraEnabled
    public static Boolean checkIfCreditCard(String opportunityId){
        Opportunity opportunityToCheck = getOpportunity(opportunityId);
        Boolean result;
        if(opportunityToCheck.FF_Payment__c=='Debit card'){
            result = true;
        }else{
            result = false;
        }
        return result;
    }

    @AuraEnabled
    public static void saveOpportunityLineItems(FF_CacheController.Basket basket){
        System.debug('Basket: ' + basket);
        List<OpportunityLineItem> lineItems = [SELECT Id FROM OpportunityLineItem WHERE OpportunityId = :basket.opportunityId];
        if(!lineItems.isEmpty()){
            delete lineItems;
        }

        for(FF_CacheController.ProductWrapper productWrapper : basket.productWrappers){
            OpportunityLineItem lineItem = new OpportunityLineItem();
            lineItem.OpportunityId = basket.opportunityId;
            lineItem.Product2Id = productWrapper.productId;
            lineItem.UnitPrice = productWrapper.unitPrice;
            lineItem.Quantity = productWrapper.quantity;
            System.debug(lineItem);
            insert lineItem;
        }
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

    @AuraEnabled
    public static void clearBasket(){
        Cache.SessionPartition shoppingCartCache = Cache.Session.getPartition('ShoppingCartCache');
        shoppingCartCache.put('basket','');
    }

    @AuraEnabled
    public static void saveOpportunity(Opportunity opportunityToSave){
        upsert opportunityToSave;
    }

    @AuraEnabled
    public static void createOrder(String opportunityId,String contactId){
        Order newOrder = FF_OpportunityToOrderService.createOrderFromOpportunity(opportunityId,'customer','Accepted unpaid',contactId);
        System.debug(newOrder);
        FF_OpportunityToOrderService.createInvoiceForOrder(newOrder,14);
        clearBasket();
    }

    @AuraEnabled
    public static void saveAddressToContact(String street, String postal, String city, String country, String state){
        Contact userContact = [SELECT Id FROM Contact WHERE Email = :UserInfo.getUserEmail()];
        userContact.MailingStreet = street;
        userContact.MailingPostalCode = postal;
        userContact.MailingCity = city;
        userContact.MailingCountry = country;
        userContact.MailingState = state;
        System.debug('*****User contact: ' + userContact);
        upsert userContact;
    }

    @AuraEnabled
    public static FF_CacheController.Basket recalculateLineItems(String productId, String opportunityId, Integer quantity){
        OpportunityLineItem lineItem = [SELECT Id,UnitPrice,TotalPrice,ListPrice,OpportunityId,Product2Id,Quantity FROM OpportunityLineItem WHERE OpportunityId = :opportunityId AND Product2Id = :productId];
        lineItem.Quantity = quantity;
        if(quantity>0){
            upsert lineItem;
        }else{
            delete lineItem;
        }

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
        System.debug(lineItemsToDelete);
        delete lineItemsToDelete;
    }

    public static FF_CacheController.Basket calculateBasket(FF_CacheController.Basket basket){
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
}