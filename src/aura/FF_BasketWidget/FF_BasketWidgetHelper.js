({

    getBasket : function(component,event){
        let action = component.get("c.checkAndReturnBasket");
        action.setCallback(this, function(response) {
            component.set("v.basket",response.getReturnValue());
            if(component.get("v.basket")!=null){
                if(component.get("v.basket").quantitiesUpdated){
                    this.fireToast($A.get("$Label.c.FF_Warning"),$A.get("$Label.c.FF_Products_availability_changed"),"warning");
                }
                component.set("v.basket.quantitiesUpdated",false);
            }
        });
        $A.enqueueAction(action);
    },

    updateBasket : function(component,event){
        let action = component.get("c.getBasketCache");
        action.setCallback(this, function(response) {
            component.set("v.basket",response.getReturnValue());
        });
        $A.enqueueAction(action);
    },

    showBasketModal : function(component,event,helper){
        let modalBody;
        let modalFooter;
        let preparedComponents;
        if(component.get("v.basket.totalQuantity")>0){
            preparedComponents = [
                ["c:FF_BasketPreview",{ basket : component.get("v.basket") }],
                ["c:FF_BasketPreviewFooter", {}]
            ];
        }else{
            preparedComponents = [
                ["c:FF_BasketPreview",{ basket : component.get("v.basket") }],
            ];
        }
        $A.createComponents(
            preparedComponents,
            function(components, status){
                if (status === "SUCCESS") {
                    modalBody = components[0];
                    modalFooter = components[1];
                    component.find('overlayLib').showCustomModal({
                       header: $A.get("$Label.c.FF_Basket"),
                       body: modalBody,
                       footer: modalFooter,
                       showCloseButton: true,
                       cssClass: "slds-modal_small",
                       closeCallback: function() {
                       }
                   })
                }
            }
        );
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