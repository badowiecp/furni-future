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
                for (SObject so : Trigger.old) {
                    handler.beforeDelete(so);
                }
            }
            else if (Trigger.isInsert) {
                for (SObject so : Trigger.new) {
                    handler.beforeInsert(so);
                }
            }
            else if (Trigger.isUpdate) {
                for (SObject so : Trigger.old) {
                    handler.beforeUpdate(so, Trigger.newMap.get(so.Id));
                }
            }
        } else {
            handler.bulkAfter();

            if (Trigger.isDelete) {
                for (SObject so : Trigger.old) {
                    handler.afterDelete(so);
                }
            }
            else if (Trigger.isInsert) {
                for (SObject so : Trigger.new) {
                    handler.afterInsert(so);
                }
            }
            else if (Trigger.isUpdate) {
                for (SObject so : Trigger.old) {
                    handler.afterUpdate(so, Trigger.newMap.get(so.Id));
                }
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
        }
        return null;
    }

}