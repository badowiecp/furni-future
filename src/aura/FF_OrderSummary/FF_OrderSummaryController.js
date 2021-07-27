({

    onInit : function(component,event,helper){
        helper.getProducts(component,event);
        helper.getOrderInfo(component,event);
    },

    handleNavigate : function(component,event,helper){
        helper.navigate(component,event);
    }

})