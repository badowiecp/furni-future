({

    checkIfShowButton : function(component,event,helper){
        let action = component.get("c.checkIfCreditCard");

        action.setParams({
            "opportunityId": component.get("v.opportunityId")
        });

        action.setCallback(this, function(response) {
            component.set("v.displayPaymentButton",response.getReturnValue());
        });
        $A.enqueueAction(action);
    },

    goToPayment : function(component,event){
        let action = component.get("c.retrieveBankUrl");

        action.setCallback(this, function(response) {
            let bankUrl = response.getReturnValue();
            var eUrl= $A.get("e.force:navigateToURL");
            eUrl.setParams({
              "url": response.getReturnValue()
            });
            eUrl.fire();
        });
        $A.enqueueAction(action);
    }

})