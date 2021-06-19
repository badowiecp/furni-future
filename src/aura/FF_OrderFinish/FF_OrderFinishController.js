({

    onInit : function(component,event,helper){
        helper.checkIfShowButton(component,event);
    },

    handleGoToPayment : function(component,event,helper){
        helper.goToPayment(component,event);
    }

})