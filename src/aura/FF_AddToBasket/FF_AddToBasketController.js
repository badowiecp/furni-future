({

    onInit : function(component,event,helper){
        helper.getPrice(component,event);
    },

    handleAddToBasket : function(component,event,helper){
        helper.validateAndAdd(component,event);
    }

})