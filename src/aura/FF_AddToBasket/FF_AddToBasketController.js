({

    onInit : function(component,event,helper){
        helper.getPrice(component,event);
    },

    handleAddToBasket : function(component,event,helper){
        helper.addToBasket(component,event);
    }

})