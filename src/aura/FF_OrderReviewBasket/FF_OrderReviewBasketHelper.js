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
                let errors = response.getError();
                this.fireToast("Error",errors[0].message,"error");
            }
            component.set("v.showSpinner",false);
        });
        $A.enqueueAction(action);
    },

    validateInput : function(component,event){
        let invalidInputs = [];
        let inputs = component.find('quantityInput');
        if(Array.isArray(inputs)){
            inputs.forEach(function(input) {
                if(input.get("v.value") > input.get("v.max") || input.get("v.value") < 0){
                    invalidInputs.push(input);
                }
            });
        }else{
            if(inputs.get("v.value") > inputs.get("v.max") || inputs.get("v.value") < 0){
                invalidInputs.push(inputs);
            }
        }
        if(invalidInputs.length > 0){
            component.set("v.quantitiesValid",false);
        }else{
           component.set("v.quantitiesValid",true);
        }
    },

    calculateTotalPrice : function(component,event){
        let prices = component.find("productTotal");
        let totalPrice = 0;
        if(Array.isArray(prices)){
            prices.forEach(function(price) {
                totalPrice += price.get("v.value");
            });
        }else{
            totalPrice = prices.get("v.value");
        }
        component.set("v.totalPrice",totalPrice);
    },

    recalculateBasket : function(component,event){
        let action = component.get("c.recalculateProductWrappers");

        action.setParams({
            "wrappers": component.get("v.basket.productWrappers"),
            "opportunityId": component.get("v.opportunityId")
        });
        console.log(component.get("v.basket"));
        action.setCallback(this, function(response) {
            let state = response.getState();
            if (state === "SUCCESS"){
                let navigate = component.get("v.navigateFlow");
                navigate(event.getParam("action"));
            }else{
                let errors = response.getError();
                this.fireToast("Error",errors[0].message,"error");
            }
        });
        $A.enqueueAction(action);
    },

    delete : function(component,event){
        let action = component.get("c.recalculateLineItems");

        action.setParams({
            "productId": event.getSource().get("v.name"),
            "opportunityId": component.get("v.opportunityId"),
            "quantity": "0"
        });

        action.setCallback(this, function(response) {
            let state = response.getState();
            if (state === "SUCCESS"){
                if(response.getReturnValue().totalQuantity!=null && response.getReturnValue().totalQuantity>0){
                    component.set("v.basket",response.getReturnValue());
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
                let errors = response.getError();
                this.fireToast("Error",errors[0].message,"error");
            }
        });
        $A.enqueueAction(action);
    },

    next : function(component,event){
        this.recalculateBasket(component,event);
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