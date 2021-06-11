public with sharing class FF_CacheController {

    @AuraEnabled
    public static void saveInCache(String productId, Decimal price, Integer quantity){
        Cache.SessionPartition  shoppingCartCache = Cache.Session.getPartition('ShoppingCartCache');
        String basketJson = (String)shoppingCartCache.get('basket');
        System.debug(basketJson);
        Product2 newProduct = [SELECT Name,Product_Name_Link__c FROM Product2 WHERE Id = :productId];
        ProductWrapper productWrapper = new ProductWrapper();
        productWrapper.productId = productId;
        productWrapper.price = price;
        productWrapper.quantity = quantity;
        productWrapper.productUrl = newProduct.Product_Name_Link__c;
        productWrapper.name = newProduct.Name;
        if(basketJson==null){
            Basket newBasket = new Basket();
            newBasket.productWrappers.add(productWrapper);
            System.debug(newBasket);
            basketJson = JSON.serialize(newBasket);
            System.debug('New basket: ' + basketJson);
        }else{
            Boolean isAlreadyInBasket = false;
            Basket currentBasket = (Basket)JSON.deserialize(basketJson,Basket.class);
            for(ProductWrapper currentProduct : currentBasket.productWrappers){
                if(currentProduct.productId==productId){
                    currentProduct.quantity += quantity;
                    isAlreadyInBasket = true;
                }
            }
            if(!isAlreadyInBasket){
                currentBasket.productWrappers.add(productWrapper);
            }
            basketJson = JSON.serialize(currentBasket);
            System.debug('Updated basket: ' + basketJson);
        }
        shoppingCartCache.put('basket',basketJson);
        String basket = (String)shoppingCartCache.get('basket');
        System.debug(basket);
    }

    @AuraEnabled
    public static List<ProductWrapper> getBasketCache(String productId){
        Cache.SessionPartition  shoppingCartCache = Cache.Session.getPartition('ShoppingCartCache');
        String basketJson = (String)shoppingCartCache.get('basket');
        Basket currentBasket = new Basket();
        if(basketJson!=null){
            currentBasket = (Basket)JSON.deserialize(basketJson,Basket.class);
        }
        List<ProductWrapper> products = new List<ProductWrapper>();
        if(currentBasket!=null){
            products = currentBasket.productWrappers;
        }
        return products;
    }

    @AuraEnabled
    public static Decimal getPriceBookEntry(String productId){
        return [SELECT UnitPrice FROM PricebookEntry WHERE Product2Id = :productId].UnitPrice;
    }

    public class Basket {
        @AuraEnabled public List<ProductWrapper> productWrappers {get;set;}

        public Basket(){
            productWrappers = new List<ProductWrapper>();
        }
    }

    public class ProductWrapper {
        @AuraEnabled public String productId {get;set;}
        @AuraEnabled public Decimal price {get;set;}
        @AuraEnabled public Integer quantity {get;set;}
        @AuraEnabled public String productUrl {get;set;}
        @AuraEnabled public String name {get;set;}
    }
}