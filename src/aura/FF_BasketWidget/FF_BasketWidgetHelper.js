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
                component.set("v.products",response.getReturnValue());
                console.log('Products fetched');
            }else{
                let error = response.getError();
                console.log("Failed with state: " + state + ' Error: ' + error[0].message + error[0].stackTrace);
            }
        });
        $A.enqueueAction(action);
    }

})