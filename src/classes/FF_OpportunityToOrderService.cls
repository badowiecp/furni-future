global without sharing class FF_OpportunityToOrderService {

    global static Order createOrderFromOpportunity(String opportunityId, String type, String status, String contactId){
        Order newOrder = createOrder(opportunityId, type, status, contactId);
        insert newOrder;

        List<OrderItem> orderItems = createOrderItems(opportunityId,newOrder.Id);
        insert orderItems;

        return newOrder;
    }

    private static Order createOrder(String opportunityId, String type, String status, String contactId){
        Order newOrder = new Order();
        Opportunity selectedOpportunity = [SELECT Id,Name,FF_Billing_city__c,FF_Billing_country__c,FF_Billing_postal_code__c,FF_Billing_street__c,FF_Billing_state__c,FF_Invoice__c,FF_Tax_number__c,FF_Company__c,FF_Delivery__c,FF_Payment__c,FF_Shipping_city__c,FF_Shipping_country__c,FF_Shipping_postal_code__c,FF_Shipping_street__c,FF_Shipping_state__c FROM Opportunity WHERE Id = :opportunityId];
        if(type=='customer'){
            newOrder.AccountId = [SELECT Id FROM Account WHERE Name = 'Personal Account'].Id;
        }
        newOrder.Status = status;
        newOrder.ShipToContactId = contactId;
        newOrder.Contact__c = contactId;
        newOrder.EffectiveDate = System.today();
        newOrder.OpportunityId = opportunityId;
        newOrder.FF_Payment__c = selectedOpportunity.FF_Payment__c;
        newOrder.FF_Delivery__c = selectedOpportunity.FF_Delivery__c;
        newOrder.ShippingStreet = selectedOpportunity.FF_Shipping_street__c;
        newOrder.ShippingPostalCode = selectedOpportunity.FF_Shipping_postal_code__c;
        newOrder.ShippingCity = selectedOpportunity.FF_Shipping_city__c;
        newOrder.ShippingCountry = selectedOpportunity.FF_Shipping_country__c;
        newOrder.ShippingState = selectedOpportunity.FF_Shipping_state__c;
        newOrder.Pricebook2Id = [SELECT Id,Name,IsActive FROM PriceBook2 WHERE IsStandard = true LIMIT 1].Id;
        if(selectedOpportunity.FF_Invoice__c){
            newOrder.FF_Invoice__c = selectedOpportunity.FF_Invoice__c;
            newOrder.BillingStreet = selectedOpportunity.FF_Billing_street__c;
            newOrder.BillingPostalCode = selectedOpportunity.FF_Billing_postal_code__c;
            newOrder.BillingCity = selectedOpportunity.FF_Billing_city__c;
            newOrder.BillingCountry = selectedOpportunity.FF_Billing_country__c;
            newOrder.BillingState = selectedOpportunity.FF_Billing_state__c;
            newOrder.FF_Billing_company__c = selectedOpportunity.FF_Company__c;
            newOrder.FF_Tax_number__c = selectedOpportunity.FF_Tax_number__c;
        }
        return newOrder;
    }

    private static List<OrderItem> createOrderItems(String opportunityId, String orderId){
        List<OrderItem> orderItems = new List<OrderItem>();
        List<OpportunityLineItem> lineItems = [SELECT Id,Product2Id,ListPrice,UnitPrice,TotalPrice,Quantity FROM OpportunityLineItem WHERE OpportunityId = :opportunityId];
        for(OpportunityLineItem lineItem : lineItems){
            OrderItem orderItem = new OrderItem();
            orderItem.OrderId = orderId;
            orderItem.Product2Id = lineItem.Product2Id;
            orderItem.Quantity = lineItem.Quantity;
            orderItem.UnitPrice = lineItem.UnitPrice;
            orderItem.PricebookEntryId = [SELECT Id FROM PricebookEntry WHERE Product2Id = :orderItem.Product2Id AND Pricebook2Id IN (SELECT Id FROM Pricebook2 WHERE IsStandard = true)].Id;
            orderItems.add(orderItem);
        }
        return orderItems;
    }

    global static void createInvoiceForOrder(Order newOrder, Integer daysToPay){
        FF_Invoice__c newInvoice = new FF_Invoice__c();
        newInvoice.Billing_contact__c = [SELECT Id FROM Contact WHERE Email = :UserInfo.getUserEmail()].Id;
        newInvoice.Due_Date__c = Date.valueOf(System.today()) + daysToPay;
        newInvoice.Order__c = newOrder.Id;
        insert newInvoice;
    }

}