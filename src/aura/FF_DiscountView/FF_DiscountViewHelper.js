({

    getAvailableProducts : function(component,event){
        let action = component.get("c.getEntriesForView");
        component.set("v.showSpinner",true);
        action.setParams({
            "pricebookId": component.get("v.pricebookId")
        });

        action.setCallback(this, function(response) {
            let state = response.getState();
            if (state === "SUCCESS"){
                component.set("v.priceBookEntryWrappers", response.getReturnValue());
            }else{
                let errors = response.getError();
                self.fireToast($A.get("$Label.c.FF_Error"),errors[0].message,"error");
            }
            component.set("v.showSpinner",false);
        });
        $A.enqueueAction(action);
    }

})