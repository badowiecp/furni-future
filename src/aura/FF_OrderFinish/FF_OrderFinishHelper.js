({

    checkIfShowButton : function(component,event){
        let action = component.get("c.checkIfCreditCard");

        action.setParams({
            "opportunityId": component.get("v.opportunityId")
        });

        action.setCallback(this, function(response) {
            component.set("v.displayPaymentButton",response.getReturnValue());
        });
        $A.enqueueAction(action);
    },

    getBankUrl : function(component,event){
        let action = component.get("c.retrieveBankUrl");

        action.setCallback(this, function(response) {
            let bankUrl = response.getReturnValue();
            console.log('Url: ' + bankUrl);
            component.set("v.bankUrl",bankUrl);
        });
        $A.enqueueAction(action);
    },

    goToPayment : function(component,event){
        var eUrl= $A.get("e.force:navigateToURL");
        eUrl.setParams({
          "url": component.get("v.bankUrl")
        });
        eUrl.fire();
    }

})