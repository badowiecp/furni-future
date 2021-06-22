({

    getAvailableProducts : function(component,event){
        var action = component.get("c.getStandardPricebookEntries");
        action.setCallback(this, function(response) {
            let state = response.getState();
            if (state === "SUCCESS"){
                component.set("v.priceBookEntries", response.getReturnValue());
            }
        });
        $A.enqueueAction(action);
    }

})