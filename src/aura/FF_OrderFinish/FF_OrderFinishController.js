({

    onInit : function(component,event,helper){
        helper.checkIfShowButton(component,event);
        helper.getBankUrl(component,event);
    },

    handleGoToPayment : function(component,event,helper){
        helper.goToPayment(component,event);
    }

})