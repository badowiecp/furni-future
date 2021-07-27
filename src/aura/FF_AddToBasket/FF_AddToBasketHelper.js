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

    checkIfGuest : function(component,event){
        let action = component.get("c.getIsGuest");
        action.setCallback(this, function(response) {
            component.set("v.isGuest",response.getReturnValue());
        });
        $A.enqueueAction(action);
    },

    navigateToLogin : function(component,event){
        let urlEvent = $A.get("e.force:navigateToURL");
        urlEvent.setParams({
          "url": "/s/login"
        });
        urlEvent.fire();
    },

    getAvailableNumber : function(component,event){
        let action = component.get("c.getWarehouseItemCount");
        action.setParams({
            "productId": component.get("v.recordId")
        });
        action.setCallback(this, function(response) {
            component.set("v.availableNumber",response.getReturnValue());
        });
        $A.enqueueAction(action);
    },

    showAvailablePickupPoints : function(component,event){
        let modalBody;
        $A.createComponents([
            ["c:ffPickupPointsList",{
                "productId": component.get("v.recordId")
            }]
        ],
        function(components, status){
            if (status === "SUCCESS") {
                modalBody = components[0];
                component.find('overlayLib').showCustomModal({
                   header: "Pickup points",
                   body: modalBody,
                   showCloseButton: true,
                   cssClass: "slds-modal_small",
                   closeCallback: function() {
                   }
                })
            }
        }
        );
    },

    validateQuantity : function(component,event){
        if(event.getSource().get("v.value") > component.get("v.availableNumber")){
            component.set("v.validQuantity",false);
        }else{
            component.set("v.validQuantity",true);
        }
    },

    validateAndAdd : function(component,event){
        if(component.get("v.quantity")>0){
            this.addToBasket(component,event);
        }else{
            this.fireToast("Warning",$A.get("$Label.c.FF_Specify_quantity_of_products_before_adding_to_cart"),"warning");
        }
    },

    subtract : function(component,event){
        component.set("v.quantity",parseInt(component.get("v.quantity"))-1);
        if(component.get("v.quantity") > component.get("v.availableNumber")){
            component.set("v.validQuantity",false);
        }else{
            component.set("v.validQuantity",true);
        }
    },

    add : function(component,event){
        component.set("v.quantity",parseInt(component.get("v.quantity"))+1);
        if(component.get("v.quantity") > component.get("v.availableNumber")){
            component.set("v.validQuantity",false);
        }else{
            component.set("v.validQuantity",true);
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