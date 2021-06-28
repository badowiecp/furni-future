({

    getPrice : function(component,event){
        let action = component.get("c.getPriceBookEntry");
        action.setParams({
            "productId": component.get("v.recordId")
        });
        action.setCallback(this, function(response) {
            component.set("v.price",response.getReturnValue());
        });
        $A.enqueueAction(action);
    },

    validateAndAdd : function(component,event){
        if(component.get("v.quantity")>0){
            this.addToBasket(component,event);
        }else{
            this.fireToast("Warning",$A.get("$Label.c.FF_Specify_quantity_of_products_before_adding_to_cart"),"warning");
        }
    },

    addToBasket : function(component,event){
        let action = component.get("c.addProductToBasketCache");
        action.setParams({
            "productId": component.get("v.recordId"),
            "price" : component.get("v.price[0].UnitPrice"),
            "quantity" : component.get("v.quantity")
        });
        action.setCallback(this, function(response) {
            let state = response.getState();
            if (state === "SUCCESS"){
                let event = $A.get("e.c:FF_ProductAddedToBasket");
                event.fire();
                this.fireToast("Success",$A.get("$Label.c.FF_Product_added_to_basket"),"success");
            }else{
                let errors = response.getError();
                this.fireToast("Error",errors[0].message,"error");
            }
        });
        $A.enqueueAction(action);
    },

    fireToast : function(title,message,type) {
        let toastEvent = $A.get("e.force:showToast");
        toastEvent.setParams({
            title: title,
            message: message,
            type: type
        });
        toastEvent.fire();
    }

})