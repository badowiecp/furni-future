({

    onInit : function(component,event){
        let action = component.get("c.fetchRatings");
        console.log('On init: ' + component.get("v.productId"));
        action.setParams({
            "productId" : component.get("v.productId")
        });
        console.log('Ratings params set');

        action.setCallback(this, function(response){
            let state = response.getState();
            console.log('state: ' + state);
            if (state === "SUCCESS"){
                component.set("v.ratings",response.getReturnValue());
                console.log('Reviews loaded: ' + response.getReturnValue().length);
            }else{
                console.log("Failed with state: " + state);
            }
        });
        $A.enqueueAction(action);
    }

})