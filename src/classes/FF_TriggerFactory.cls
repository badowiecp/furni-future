public with sharing class FF_TriggerFactory {

    public static void createHandler(Schema.sObjectType soType) {
        FF_TriggerHandler handler = getHandler(soType);

        if (handler != null) {
            execute(handler);
        }

    }

    private static void execute(FF_TriggerHandler handler) {
        if (Trigger.isBefore) {
            handler.bulkBefore();

            if (Trigger.isDelete) {
                handler.beforeDelete(Trigger.old, Trigger.oldMap);
            }
            else if (Trigger.isInsert) {
                handler.beforeInsert(Trigger.new);
            }
            else if (Trigger.isUpdate) {
                handler.beforeUpdate(Trigger.new, Trigger.newMap, Trigger.old, Trigger.oldMap);
            }
        } else {
            handler.bulkAfter();

            if (Trigger.isDelete) {
                handler.afterDelete(Trigger.old, Trigger.oldMap);
            }
            else if (Trigger.isInsert) {
                handler.afterInsert(Trigger.new, Trigger.newMap);
            }
            else if (Trigger.isUpdate) {
                handler.afterUpdate(Trigger.new, Trigger.newMap, Trigger.old, Trigger.oldMap);
            }
        }
        handler.andFinally();
    }

    private static FF_TriggerHandler getHandler(Schema.sObjectType soType) {
        if (soType == Case.SObjectType) {
            return new FF_CaseTriggerHandler();
        }else if (soType == Lead.SObjectType) {
            return new FF_LeadTriggerHandler();
        }else if (soType == FF_Product_Rating__c.SObjectType) {
            return new FF_ProductRatingTriggerHandler();
        }else if (soType == Quote_event__e.SObjectType) {
            return new FF_QuoteTriggerHandler();
        }else if (soType == Order.SObjectType){
            return new FF_OrderTriggerHandler();
        }else if (soType == OrderItem.SObjectType){
            return new FF_OrderItemTriggerHandler();
        }
        return null;
    }

}