public with sharing class FF_CacheController {

    @AuraEnabled
    public static void saveInCache(String productId, Decimal price, Integer quantity){
        Cache.SessionPartition  shoppingCartCache = Cache.Session.getPartition('ShoppingCartCache');
        String basketJson = (String)shoppingCartCache.get('basket');
        System.debug(basketJson);
        Product2 newProduct = [SELECT Id,Name,Product_Name_Link__c FROM Product2 WHERE Id = :productId];
        ProductWrapper productWrapper = new ProductWrapper();
        productWrapper.productId = productId;
        productWrapper.unitPrice = price;
        productWrapper.quantity = quantity;
        productWrapper.productUrl = newProduct.Product_Name_Link__c;
        productWrapper.name = newProduct.Name;
        if(String.isEmpty(basketJson)){
            Basket newBasket = new Basket();
            newBasket.productWrappers.add(productWrapper);
            System.debug(newBasket);
            newBasket = calculateBasket(newBasket);
            newBasket.products.add(newProduct);
            basketJson = JSON.serialize(newBasket);
            System.debug('New basket: ' + basketJson);
        }else{
            Boolean isAlreadyInBasket = false;
            Basket currentBasket = (Basket)JSON.deserialize(basketJson,Basket.class);
            for(ProductWrapper currentProduct : currentBasket.productWrappers){
                if(currentProduct.productId==productId){
                    currentProduct.quantity = quantity;
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
            System.debug('Updated basket: ' + basketJson);
        }
        shoppingCartCache.put('basket',basketJson);
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
            System.debug('Basket from opportunity: ' + basket);
        }
        return getBasketCache();
    }

    @AuraEnabled
    public static Basket getBasketFromOpportunity(String opportunityId){
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

    @AuraEnabled
    public static Basket getBasketCache(){
        Cache.SessionPartition  shoppingCartCache = Cache.Session.getPartition('ShoppingCartCache');
        String basketJson = (String)shoppingCartCache.get('basket');
        Basket currentBasket = new Basket();
        if(basketJson!=null){
            currentBasket = (Basket)JSON.deserialize(basketJson,Basket.class);
        }
        return currentBasket;
    }

    @AuraEnabled
    public static Decimal getPriceBookEntry(String productId){
        return [SELECT UnitPrice FROM PricebookEntry WHERE Product2Id = :productId].UnitPrice;
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

    public static List<Product2> parseWrapperListToProductList(List<ProductWrapper> wrappers){
        List<Product2> productList = new List<Product2>();
        for(ProductWrapper wrapper : wrappers){
            productList.add(parseWrapperToProduct(wrapper));
        }
        return productList;
    }

    public static Product2 parseWrapperToProduct(ProductWrapper wrapper){
        Product2 newProduct = new Product2();
        newProduct.Id = wrapper.productId;
        newProduct.Name = wrapper.name;
        return newProduct;
    }

    public class Basket {
        @AuraEnabled public List<ProductWrapper> productWrappers {get;set;}
        @AuraEnabled public List<Product2> products {get;set;}
        @AuraEnabled public Integer totalQuantity {get;set;}
        @AuraEnabled public Decimal totalPrice {get;set;}
        @AuraEnabled public String opportunityId {get;set;}

        public Basket(){
            productWrappers = new List<ProductWrapper>();
            products = new List<Product2>();
            opportunityId = null;
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
    }
}