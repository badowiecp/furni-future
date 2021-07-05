public without sharing class FF_ProductStorageUtils {

    public static void validateOrder(List<OrderItem> triggerList){
        List<String> unavailableItems = getUnavailableProducts(triggerList);
        if(!unavailableItems.isEmpty()){
            Order invalidOrder = [SELECT Id FROM Order WHERE Id =:triggerList[0].OrderId];
            delete invalidOrder;
            triggerList[0].addError(new FF_UnavailableProductsException('We are sorry, some of your products are not currently available at the quantity you requested: ' + String.join(unavailableItems,', ') + '. ' + 'Please return to your basket and adjust product quantities accordingly'),false);
        }else{
            updateStorage(triggerList);
        }
    }

    private static void updateStorage(List<OrderItem> triggerList){
        for(OrderItem item : triggerList){
            removeFromStorage(item);
        }
    }

    private static void removeFromStorage(OrderItem item){
        Decimal quantity = item.Quantity;
        List<FF_Warehouse_Item__c> warehouseItemsToDelete = new List<FF_Warehouse_Item__c>();
        List<FF_Warehouse_Item__c> warehouseItemsToUpdate = new List<FF_Warehouse_Item__c>();
        for(FF_Warehouse_Item__c warehouseItem : [SELECT Id,Name,FF_Quantity__c FROM FF_Warehouse_Item__c WHERE FF_Product__c = :item.Product2Id ORDER BY FF_Quantity__c ASC]){
            if(warehouseItem.FF_Quantity__c > quantity){
                warehouseItem.FF_Quantity__c -= quantity;
                warehouseItemsToUpdate.add(warehouseItem);
                break;
            }else{
                quantity -= warehouseItem.FF_Quantity__c;
                warehouseItemsToDelete.add(warehouseItem);
            }
        }
        upsert warehouseItemsToUpdate;
        delete warehouseItemsToDelete;
    }

    private static List<String> getUnavailableProducts(List<OrderItem> triggerList){
        List<String> unavailableItems = new List<String>();
        for(OrderItem orderItem : triggerList){
            Decimal availableNumber = getAvailableNumber(orderItem);
            if(availableNumber < orderItem.Quantity){
                String productName = [SELECT Name FROM Product2 WHERE Id = :orderItem.Product2Id].Name;
                unavailableItems.add(productName + ' - ' + 'currently available ' + availableNumber);
            }
        }
        return unavailableItems;
    }

    private static Integer getAvailableNumber(OrderItem item){
        Decimal sum = (Decimal)[SELECT SUM(FF_Quantity__c) quantity FROM FF_Warehouse_Item__c WHERE FF_Quantity__c > 0 AND FF_Product__c = :item.Product2Id][0].get('quantity');
        return sum != null ? Integer.valueOf(sum) : 0;
    }
}