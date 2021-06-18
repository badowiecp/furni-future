({

    getProducts : function(component,event){
        let action = component.get("c.checkAndReturnBasket");
        console.log('ProductId: ' + component.get("v.recordId"));
        console.log('Params set');
        action.setCallback(this, function(response) {
            let state = response.getState();
            if (state === "SUCCESS"){
                component.set("v.basket",response.getReturnValue());
                console.log('Products fetched');
            }else{
                let error = response.getError();
                console.log("Failed with state: " + state + ' Error: ' + error[0].message + error[0].stackTrace);
            }
        });
        $A.enqueueAction(action);
    },

    getOrderInfo: function(component,event){
        let action = component.get("c.getOpportunity");
        action.setParams({
            "opportunityId": component.get("v.opportunityId")
        });
        action.setCallback(this, function(response) {
            let state = response.getState();
            if (state === "SUCCESS"){
                component.set("v.opportunityFields",response.getReturnValue());
                console.log('Opportunity fetched with delivery: ' + response.getReturnValue().FF_Delivery__c);
            }else{
                let error = response.getError();
                console.log("Failed with state: " + state + ' Error: ' + error[0].message + error[0].stackTrace);
            }
        });
        $A.enqueueAction(action);
    },

    confirm : function(component,event){
        let action = component.get("c.createOrder");
        action.setParams({
            "opportunityId": component.get("v.opportunityId"),
            "contactId": component.get("v.opportunityFields.ContactId")
        });
        action.setCallback(this, function(response) {
            let state = response.getState();
            if (state === "SUCCESS"){
                console.log('Order created');
            }else{
                let error = response.getError();
                console.log("Failed with state: " + state + ' Error: ' + error[0].message + error[0].stackTrace);
            }
        });
        $A.enqueueAction(action);
    },

    navigate : function(component,event){
        var navigate = component.get("v.navigateFlow");
        var action = event.getParam("action");
        console.log('Enter navigate');
        if(action=='NEXT'){
            this.confirm(component,event);
        }
        navigate(action);
    }

})