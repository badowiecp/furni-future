({

    getProducts : function(component,event){
        component.set("v.showSpinner",true);
        let action = component.get("c.checkAndReturnBasket");
        action.setCallback(this, function(response) {
            let state = response.getState();
            if (state === "SUCCESS"){
                component.set("v.basket",response.getReturnValue());
            }else{
                let errors = response.getError();
                this.fireToast("Error",errors[0].message,"error");
            }
            component.set("v.showSpinner",false);
        });
        $A.enqueueAction(action);
    },

    getOrderInfo: function(component,event){
        component.set("v.showSpinner",true);
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
            component.set("v.showSpinner",false);
        });
        $A.enqueueAction(action);
    },

    confirm : function(component,event){
        component.set("v.showSpinner",true);
        let action = component.get("c.createOrder");
        action.setParams({
            "opportunityId": component.get("v.opportunityId"),
            "contactId": component.get("v.opportunityFields.ContactId")
        });
        action.setCallback(this, function(response) {
            let state = response.getState();
            if(state === "SUCCESS"){
                let action = event.getParam("action");
                let navigate = component.get("v.navigateFlow");
                navigate(action);
            }else{
                let errors = response.getError();
                this.fireToast("Error",errors[0].message,"error");
            }
            component.set("v.showSpinner",false);
        });
        $A.enqueueAction(action);
    },

    navigate : function(component,event){
        let action = event.getParam("action");
        if(action=='NEXT'){
            this.confirm(component,event);
        }else{
            let navigate = component.get("v.navigateFlow");
            navigate(action);
        }
    },

    fireToast : function(title,message,type) {
        let toastEvent = $A.get("e.force:showToast");
        toastEvent.setParams({
            title: title,
            message: message,
            type: type,
            mode: 'sticky'
        });
        toastEvent.fire();
    }

})