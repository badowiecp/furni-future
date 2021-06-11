({

    getPrice : function(component,event){
        let action = component.get("c.getPriceBookEntry");
        action.setParams({
            "productId": component.get("v.recordId")
        });
        console.log('ProductId: ' + component.get("v.recordId"));
        console.log('Params set');
        action.setCallback(this, function(response) {
            let state = response.getState();
            if (state === "SUCCESS"){
                component.set("v.price",response.getReturnValue());
                console.log('Price fetched');
            }else{
                let error = response.getError();
                console.log("Failed with state: " + state + ' Error: ' + error[0].message + error[0].stackTrace);
            }
        });
        $A.enqueueAction(action);
    },

    addToBasket : function(component,event){
        let action = component.get("c.saveInCache");
        action.setParams({
            "productId": component.get("v.recordId"),
            "price" : component.get("v.price"),
            "quantity" : component.get("v.quantity")
        });
        console.log('ProductId: ' + component.get("v.recordId"));
        console.log('Params set');
        action.setCallback(this, function(response) {
            let state = response.getState();
            if (state === "SUCCESS"){
                let event = $A.get("e.c:FF_ProductAddedToBasket");
                event.fire();

                let toastEvent = $A.get("e.force:showToast");
                toastEvent.setParams({
                    "title": "Success",
                    "message": "Product added to basket",
                    "type" : "success"
                });
                toastEvent.fire();

                console.log('Successfully saved to cache')
            }else{
                let error = response.getError();
                console.log("Failed with state: " + state + ' Error: ' + error[0].message + error[0].stackTrace);
            }
        });
        $A.enqueueAction(action);
    }

})