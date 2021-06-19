({

    onInit : function(component,event,helper){
        helper.prepareOpportunity(component,event);
    },

    handleNavigate : function(component,event,helper){
        helper.navigate(component,event);
    },

    handleInvoiceChange : function(component,event,helper){
        helper.checkInvoice(component,event);
    }

})