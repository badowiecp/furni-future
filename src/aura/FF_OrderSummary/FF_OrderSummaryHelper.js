({

    getProducts : function(component,event){
        let action = component.get("c.checkAndReturnBasket");
        action.setCallback(this, function(response) {
            let state = response.getState();
            if (state === "SUCCESS"){
                component.set("v.basket",response.getReturnValue());
            }else{
                let errors = response.getError();
                this.fireToast("Error",errors[0].message,"error");
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
            }else{
                let errors = response.getError();
                this.fireToast("Error",errors[0].message,"error");
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
            if (state === "ERROR"){
                let errors = response.getError();
                this.fireToast("Error",errors[0].message,"error");
            }
        });
        $A.enqueueAction(action);
    },

    navigate : function(component,event){
        var navigate = component.get("v.navigateFlow");
        var action = event.getParam("action");
        if(action=='NEXT'){
            this.confirm(component,event);
        }
        navigate(action);
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