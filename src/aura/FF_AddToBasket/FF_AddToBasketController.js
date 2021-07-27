({

    onInit : function(component,event,helper){
        helper.getPrice(component,event);
        helper.getAvailableNumber(component,event);
        helper.checkIfGuest(component,event);
    },

    handleAddToBasket : function(component,event,helper){
        if(component.get("v.isGuest")){
            helper.navigateToLogin(component,event);
        }else{
            helper.validateAndAdd(component,event);
        }
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