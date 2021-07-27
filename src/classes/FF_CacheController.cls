public without sharing class FF_CacheController {

    @AuraEnabled
    public static void addProductToBasketCache(String productId, Decimal price, Integer quantity){
        Cache.SessionPartition shoppingCartCache = Cache.Session.getPartition('ShoppingCartCache');
        String basketJson = (String)shoppingCartCache.get('basket');
        Product2 newProduct = [SELECT Id,Name,Product_Name_Link__c FROM Product2 WHERE Id = :productId];
        try{
            ProductWrapper productWrapper = parseProductToWrapper(newProduct,price,quantity);
            if(String.isEmpty(basketJson)){
                basketJson = prepareAndSerializeNewBasket(productWrapper,newProduct);
            }else{
                basketJson = recalculateAndSerializeExistingBasket(basketJson,productWrapper,newProduct);
            }
            shoppingCartCache.put('basket',basketJson);
        }catch (Exception exc){
            throw new AuraHandledException(System.Label.FF_Cannot_add_product_to_basket);
        }
    }

    @AuraEnabled
    public static Basket checkAndReturnBasket(){
        String userId = UserInfo.getUserId();
        List<Opportunity> usersOpportunities = [SELECT Id FROM Opportunity WHERE CreatedById = :userId AND (NOT StageName LIKE '%Closed%')];
        if(!usersOpportunities.isEmpty()){
            String currentOpportunityId = usersOpportunities[0].Id;
            Basket basket = getBasketFromOpportunity(currentOpportunityId);
            basket = calculateBasket(basket);
            Cache.SessionPartition shoppingCartCache = Cache.Session.getPartition('ShoppingCartCache');
            String basketJson = JSON.serialize(basket);
            shoppingCartCache.put('basket',basketJson);
        }
        return getBasketCache();
    }

    @AuraEnabled
    public static Basket getBasketCache(){
        Cache.SessionPartition  shoppingCartCache = Cache.Session.getPartition('ShoppingCartCache');
        String basketJson = (String)shoppingCartCache.get('basket');
        Basket currentBasket = new Basket();
        if(String.isNotEmpty(basketJson)){
            currentBasket = (Basket)JSON.deserialize(basketJson,Basket.class);
            for(ProductWrapper wrapper : currentBasket.productWrappers){
                wrapper.unitPrice = returnCurrentPrice(wrapper.productId);
            }
            currentBasket = calculateBasket(getOnlyAvailableProducts(currentBasket));
            basketJson = JSON.serialize(currentBasket);
            shoppingCartCache.put('basket',basketJson);
        }
        return currentBasket;
    }

    @AuraEnabled
    public static Boolean getIsGuest(){
        return UserInfo.getName() == 'Furni Future Community Page Site Guest User' ? true : false;
    }

    @AuraEnabled
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

    @AuraEnabled
    public static Integer getWarehouseItemCount(String productId){
        Integer count = 0;
        for(FF_Warehouse_Item__c item : [SELECT Id,FF_Quantity__c FROM FF_Warehouse_Item__c WHERE FF_Product__c = :productId]){
            count += Integer.valueOf(item.FF_Quantity__c);
        }
        return count;
    }

    private static Basket getOnlyAvailableProducts(Basket basket){
        for(ProductWrapper productWrapper : basket.productWrappers){
            if(setValidQuantity(productWrapper) && basket !=null){
                basket.quantitiesUpdated = true;
            }
        }
        return basket;
    }

    private static Boolean setValidQuantity(ProductWrapper productWrapper){
        Boolean quantityChanged = false;
        productWrapper.availableStock = Integer.valueOf(getAvailableNumber(productWrapper.productId));
        if(productWrapper.availableStock < productWrapper.quantity){
            productWrapper.quantity = Integer.valueOf(productWrapper.availableStock);
            quantityChanged = true;
        }
        return quantityChanged;
    }

    private static Integer getAvailableNumber(String productId){
        Decimal sum = (Decimal)[SELECT SUM(FF_Quantity__c) quantity FROM FF_Warehouse_Item__c WHERE FF_Quantity__c > 0 AND FF_Product__c = :productId][0].get('quantity');
        return sum != null ? Integer.valueOf(sum) : 0;
    }

    public static Basket calculateBasket(Basket basket){
        basket.totalQuantity=0;
        basket.totalPrice=0;
        for(ProductWrapper productWrapper : basket.productWrappers){
            if(productWrapper.quantity>0){
                basket.totalQuantity += productWrapper.quantity;
                basket.totalPrice += productWrapper.price;
            }
        }
        return basket;
    }

    private static Basket getBasketFromOpportunity(String opportunityId){
        Basket basket = new Basket();
        basket.opportunityId = opportunityId;
        List<OpportunityLineItem> lineItems = [SELECT Id,Name,Product2.Name,Product2Id,UnitPrice,Quantity FROM OpportunityLineItem WHERE OpportunityId=:opportunityId];
        if(!lineItems.isEmpty()){
            for(OpportunityLineItem lineItem : lineItems){
                ProductWrapper productWrapper = new ProductWrapper();
                productWrapper.productId = lineItem.Product2Id;
                productWrapper.quantity = Integer.valueOf(lineItem.Quantity);
                productWrapper.unitPrice = lineItem.UnitPrice;
                productWrapper.name = lineItem.Product2.Name;
                basket.productWrappers.add(productWrapper);
            }
        }
        return basket;
    }

    private static String prepareAndSerializeNewBasket(ProductWrapper productWrapper, Product2 newProduct){
        Basket newBasket = new Basket();
        newBasket.productWrappers.add(productWrapper);
        newBasket = calculateBasket(newBasket);
        newBasket.products.add(newProduct);
        String basketJson = JSON.serialize(newBasket);
        return basketJson;
    }

    private static String recalculateAndSerializeExistingBasket(String basketJson, ProductWrapper productWrapper, Product2 newProduct){
        Boolean isAlreadyInBasket = false;
        Basket currentBasket = (Basket)JSON.deserialize(basketJson,Basket.class);
        for(ProductWrapper currentProduct : currentBasket.productWrappers){
            if(currentProduct.productId==productWrapper.productId){
                currentProduct.quantity = productWrapper.quantity;
                isAlreadyInBasket = true;
            }
        }
        if(!isAlreadyInBasket){
            currentBasket.productWrappers.add(productWrapper);
            currentBasket.products.add(newProduct);
        }
        currentBasket = calculateBasket(currentBasket);
        currentBasket.products = parseWrapperListToProductList(currentBasket.productWrappers);
        basketJson = JSON.serialize(currentBasket);
        return basketJson;
    }

    private static Decimal returnCurrentPrice(String productId){
        Contact userContact = [SELECT Id,Email FROM Contact WHERE Email = :UserInfo.getUserEmail()];
        List<PricebookEntry> entries = [SELECT Id,UnitPrice,IsActive FROM PricebookEntry WHERE IsActive = true AND Product2Id = :productId AND (Pricebook2.FF_Furni_Club_member__c = NULL OR Pricebook2.FF_Furni_Club_member__c = :userContact.Id) ORDER BY UnitPrice ASC];
        Decimal price = entries[0].UnitPrice;
        return price;
    }

    private static List<Product2> parseWrapperListToProductList(List<ProductWrapper> wrappers){
        List<Product2> productList = new List<Product2>();
        for(ProductWrapper wrapper : wrappers){
            productList.add(parseWrapperToProduct(wrapper));
        }
        return productList;
    }

    private static Product2 parseWrapperToProduct(ProductWrapper wrapper){
        Product2 newProduct = new Product2();
        newProduct.Id = wrapper.productId;
        newProduct.Name = wrapper.name;
        return newProduct;
    }

    private static ProductWrapper parseProductToWrapper(Product2 product, Decimal price, Integer quantity){
        ProductWrapper productWrapper = new ProductWrapper();
        productWrapper.productId = product.Id;
        productWrapper.unitPrice = price;
        productWrapper.quantity = quantity;
        productWrapper.productUrl = product.Product_Name_Link__c;
        productWrapper.name = product.Name;
        return productWrapper;
    }

    public class Basket {
        @AuraEnabled public List<ProductWrapper> productWrappers {get;set;}
        @AuraEnabled public List<Product2> products {get;set;}
        @AuraEnabled public Integer totalQuantity {get;set;}
        @AuraEnabled public Decimal totalPrice {get;set;}
        @AuraEnabled public String opportunityId {get;set;}
        @AuraEnabled public Boolean quantitiesUpdated {get;set;}

        public Basket(){
            productWrappers = new List<ProductWrapper>();
            products = new List<Product2>();
            opportunityId = null;
            quantitiesUpdated = false;
        }
    }

    public class ProductWrapper {
        @AuraEnabled public String productId {get;set;}
        @AuraEnabled public Decimal unitPrice {get;set;}
        @AuraEnabled public Decimal price {get{
            return unitPrice * quantity;
        }set;}
        @AuraEnabled public Integer quantity {get;set;}
        @AuraEnabled public String productUrl {get;set;}
        @AuraEnabled public String name {get;set;}
        @AuraEnabled public Decimal availableStock {get;set;}
    }
}