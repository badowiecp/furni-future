({

    checkIfShowButton : function(component,event,helper){
        let action = component.get("c.checkIfCreditCard");

        console.log('Finish button opportunity Id: ' + component.get("v.opportunityId"));
        action.setParams({
            "opportunityId": component.get("v.opportunityId")
        });

        action.setCallback(this, function(response) {
            let state = response.getState();
            if (state === "SUCCESS"){
                component.set("v.displayPaymentButton",response.getReturnValue());
                console.log('Payment: ' + response.getReturnValue());
            }else{
                let error = response.getError();
                console.log("Failed with state: " + state + ' Error: ' + error[0].message + error[0].stackTrace);
            }
        });
        $A.enqueueAction(action);
    }

})