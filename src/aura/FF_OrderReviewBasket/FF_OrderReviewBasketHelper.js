({

    getBasket : function(component,event){
        component.set("v.showSpinner",true);
        let action = component.get("c.checkAndReturnBasket");
        action.setCallback(this, function(response) {
            let state = response.getState();
            if (state === "SUCCESS"){
                component.set("v.basket",response.getReturnValue());
                component.set("v.opportunityId",response.getReturnValue().opportunityId);
            }else{
                let error = response.getError();
                this.fireToast("Error",errors[0].message,"error");
            }
            component.set("v.showSpinner",false);
        });
        $A.enqueueAction(action);
    },

    change : function(component,event){
        component.set("v.showSpinner",true);
        let action = component.get("c.recalculateLineItems");

        action.setParams({
            "productId": event.getSource().get("v.value"),
            "opportunityId": component.get("v.opportunityId"),
            "quantity": event.getSource().get("v.name")
        });

        action.setCallback(this, function(response) {
            let state = response.getState();
            if (state === "SUCCESS"){
                if(response.getReturnValue().totalQuantity!=null && response.getReturnValue().totalQuantity>0){
                    component.set("v.basket",response.getReturnValue());
                    this.fireToast("Success",$A.get("$Label.c.FF_Basket_updated"),"success");
                }else{
                    event.preventDefault();
                    let navService = component.find("navService");
                    let pageReference = {
                        type: "comm__namedPage",
                        attributes: {
                            name: "Explore_products__c"
                        }
                    };
                    navService.navigate(pageReference);
                }
            }else{
                let error = response.getError();
                this.fireToast("Error",errors[0].message,"error");
            }
            component.set("v.showSpinner",false);
        });
        $A.enqueueAction(action);
    },

    next : function(component,event){
        let navigate = component.get("v.navigateFlow");
        navigate(event.getParam("action"));
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