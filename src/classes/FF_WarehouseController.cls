public without sharing class FF_WarehouseController {

    @AuraEnabled
    public static List<FF_Warehouse__c> getWarehouses(String city, Integer capacity){
        List<FF_Warehouse__c> warehouses = new List<FF_Warehouse__c>();
        String queryString = prepareQuery(city,capacity);
        try{
            return Database.query(queryString);
        }catch (Exception exc){
            throw new AuraHandledException(System.Label.FF_Error_retrieving_warehouses_data);
        }
    }

    @AuraEnabled
    public static List<WarehouseProductWrapper> getProducts(String warehouseId){
        List<WarehouseProductWrapper> productWrappers = new List<WarehouseProductWrapper>();
        Map<Id, Decimal> productQuantityMap = new Map<Id, Decimal>();
        try{
            if(String.isNotBlank(warehouseId)){
                for(FF_Warehouse_Item__c item : [SELECT Id,Name,FF_Quantity__c,FF_Product__c,FF_Total_storage_size__c FROM FF_Warehouse_Item__c WHERE FF_Warehouse__c = :warehouseId]){
                    productQuantityMap.put(item.FF_Product__c,item.FF_Quantity__c);
                }
            }

            for(Product2 product : [SELECT Id,Name,FF_Storage_size__c,Family,Product_Name_Link__c FROM Product2]){
                WarehouseProductWrapper wrapper = new WarehouseProductWrapper();
                wrapper.product = product;
                if(productQuantityMap.keySet().contains(product.Id)){
                    wrapper.quantity = productQuantityMap.get(product.Id);
                    wrapper.totalSize = wrapper.quantity * product.FF_Storage_size__c;
                }
                productWrappers.add(wrapper);
            }
            return productWrappers;
        }catch(Exception exc){
            throw new AuraHandledException(System.Label.FF_Cannot_retrieve_products);
        }
    }

    @AuraEnabled
    public static FF_Warehouse__c getWarehouseById(String warehouseId){
        return [SELECT Id,Name,FF_Street__c,FF_City__c,FF_Country__c,FF_Postal_code__c,FF_Location__Latitude__s,FF_Location__Longitude__s,FF_Storage_capacity__c,FF_Storage_capacity_used__c FROM FF_Warehouse__c WHERE Id = :warehouseId][0];
    }

    @AuraEnabled
    public static List<PickupPointWrapper> getAvailablePickupPoints(String productId){
        List<PickupPointWrapper> pickupPointWrappers = new List<PickupPointWrapper>();
        Map<Id, FF_Warehouse_Item__c> warehouseItems = new Map<Id, FF_Warehouse_Item__c>();
        try{
            for(FF_Warehouse_Item__c item :[SELECT Id,Name,FF_Quantity__c,FF_Warehouse__c FROM FF_Warehouse_Item__c WHERE FF_Product__c = :productId]){
                warehouseItems.put(item.FF_Warehouse__c,item);
            }
            for(FF_Warehouse__c warehouse : [SELECT Id,Name,FF_Postal_code__c,FF_Country__c,FF_City__c,FF_Street__c FROM FF_Warehouse__c WHERE Id IN :warehouseItems.keySet()]){
                PickupPointWrapper wrapper = new PickupPointWrapper();
                wrapper.warehouse = warehouse;
                wrapper.availableStock = Integer.valueOf(warehouseItems.get(warehouse.Id).FF_Quantity__c);
                pickupPointWrappers.add(wrapper);
            }
            return pickupPointWrappers;
        }catch (Exception exc){
            throw new AuraHandledException(System.Label.FF_Error_retrieving_warehouses_data);
        }
    }

    @AuraEnabled
    public static void saveWarehouseProducts(List<WarehouseProductWrapper> wrappers, String warehouseId){
        List<FF_Warehouse_Item__c> items = [SELECT Id FROM FF_Warehouse_Item__c WHERE FF_Warehouse__c = :warehouseId];
        if(!items.isEmpty()){
            delete items;
            items.clear();
        }
        try {
            for(WarehouseProductWrapper wrapper : wrappers){
                if(wrapper.quantity != null && wrapper.quantity > 0){
                    FF_Warehouse_Item__c newItem = new FF_Warehouse_Item__c();
                    newItem.Name = wrapper.product.Name;
                    newItem.FF_Warehouse__c = warehouseId;
                    newItem.FF_Product__c = wrapper.product.Id;
                    newItem.FF_Quantity__c = wrapper.quantity;
                    items.add(newItem);
                }
            }
            System.System.debug(items);
            insert items;
        } catch (Exception exc) {
            throw new AuraHandledException(System.Label.FF_Could_not_save_storage);
        }
    }

    private static String prepareQuery(String city, Integer capacity){
        String queryString = 'SELECT Id,Name,FF_Street__c,FF_City__c,FF_Country__c,FF_Postal_code__c,FF_Location__Latitude__s,FF_Location__Longitude__s,FF_Storage_capacity__c,FF_Storage_capacity_used__c FROM FF_Warehouse__c ';
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

    public class PickupPointWrapper{
        @AuraEnabled public FF_Warehouse__c warehouse { get; set; }
        @AuraEnabled public Integer availableStock { get; set; }
    }

    public class WarehouseProductWrapper {
        @AuraEnabled public Product2 product { get; set; }
        @AuraEnabled public Decimal quantity { get; set; }
        @AuraEnabled public Decimal totalSize { get; set; }
    }

}