({

    getProducts : function(component,event){
        let action = component.get("c.getRecentProducts");
        action.setCallback(this, function(response) {
            let state = response.getState();
            if(component.isValid() && state === 'SUCCESS') {
                component.set("v.products", response.getReturnValue());
            }else{
                let errors = response.getError();
                let toastEvent = $A.get("e.force:showToast");
                toastEvent.setParams({
                    title: $A.get("$Label.c.FF_Error"),
                    message: errors[0].message,
                    type: "error"
                });
                toastEvent.fire();
            }
        });
        $A.enqueueAction(action);
    }

})