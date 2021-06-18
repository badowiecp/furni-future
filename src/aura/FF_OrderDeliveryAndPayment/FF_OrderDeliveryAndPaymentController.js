({

    onInit : function(component,event,helper){
        helper.prepareOpportunity(component,event);
    },

    handleNavigate : function(component,event,helper){
        console.log('Component enter navigate');
//        helper.validateInputs(component,event);
//        console.log('Validation performed');
//        console.log('Valid: ' + component.get("v.inputsValid"));
//        console.log('Delivery: ' + component.get("v.opportunityFields.FF_Delivery__c"));
//        console.log('Payment: ' + component.get("v.opportunityFields.FF_Payment__c"));
//        if(component.get("v.inputsValid")){
            helper.navigate(component,event);
//        }
    },

    handleInvoiceChange : function(component,event,helper){
        component.set("v.invoice",event.getSource().get("v.value"));
    }

})