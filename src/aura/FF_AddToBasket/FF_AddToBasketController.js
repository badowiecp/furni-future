({

    onInit : function(component,event,helper){
        helper.getPrice(component,event);
        helper.getAvailableNumber(component,event);
    },

    handleAddToBasket : function(component,event,helper){
        helper.validateAndAdd(component,event);
    },

    handleCheckPickup : function(component,event,helper){
        helper.showAvailablePickupPoints(component,event);
    },

    checkIfStockAvailable : function(component,event,helper){
        helper.validateQuantity(component,event);
    },

    handleSubtract : function(component,event,helper){
        helper.subtract(component,event);
    },

    handleAdd : function(component,event,helper){
        helper.add(component,event);
    }

})