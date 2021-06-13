({

    getBasket : function(component,event){
        let action = component.get("c.getBasketCache");
        action.setParams({
            "productId": component.get("v.recordId")
        });
        console.log('ProductId: ' + component.get("v.recordId"));
        console.log('Params set');
        action.setCallback(this, function(response) {
            let state = response.getState();
            if (state === "SUCCESS"){
                component.set("v.basket",response.getReturnValue());
//                component.set("v.productsQuantity",response.getReturnValue().totalQuantity);
//                component.set("v.productsPrice",response.getReturnValue().totalPrice);
                console.log('Products fetched');
            }else{
                let error = response.getError();
                console.log("Failed with state: " + state + ' Error: ' + error[0].message + error[0].stackTrace);
            }
        });
        $A.enqueueAction(action);
    },

    showBasketModal : function(component,event,helper){
        var modalBody;
        var modalFooter;
        $A.createComponents(
            [
                ["c:FF_BasketPreview",{ basket : component.get("v.basket") }],
                ["c:FF_BasketPreviewFooter", {}]
            ],
            function(components, status){
                if (status === "SUCCESS") {
                    modalBody = components[0];
                    modalFooter = components[1];
                    component.find('overlayLib').showCustomModal({
                       header: "Basket",
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
    }

})