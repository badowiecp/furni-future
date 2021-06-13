({

    onInit : function(component,event,helper){
        helper.getPrice(component,event);
    },

    handleAddToBasket : function(component,event,helper){
        if(component.get("v.quantity")>0){
            helper.addToBasket(component,event);
        }else{
            let toastEvent = $A.get("e.force:showToast");
            toastEvent.setParams({
                "title": "Warning",
                "message": "Specify quantity of products before adding to cart",
                "type" : "warning"
            });
            toastEvent.fire();
        }
    }

})