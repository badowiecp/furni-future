({

    prepareOpportunity : function(component,event){
        let action = component.get("c.getOpportunity");

        console.log('Delivery opportunity Id: ' + component.get("v.opportunityId"));
        action.setParams({
            "opportunityId": component.get("v.opportunityId")
        });

        action.setCallback(this, function(response) {
            let state = response.getState();
            if (state === "SUCCESS"){
                component.set("v.opportunityFields",response.getReturnValue());
                console.log('Opportunity retrieved');
            }else{
                let error = response.getError();
                console.log("Failed with state: " + state + ' Error: ' + error[0].message + error[0].stackTrace);
            }
        });
        $A.enqueueAction(action);
    },

    navigate : function(component,event){
        console.log('Enter navigate');
        var navigate = component.get("v.navigateFlow");
        var action = event.getParam("action");

        if(action=='NEXT'){
            this.validateInputs(component,event);
            if(component.get("v.inputsValid")){
                this.saveShippingAddressToContact(component,event);
                this.saveDeliveryAndPaymentInfo(component,event);
                navigate(action);
            }
        }else{
            navigate(action);
        }

    },

    saveDeliveryAndPaymentInfo: function(component, event) {
        console.log('Enter save opportunity');
        let action = component.get("c.saveOpportunity");
        console.log('Opportunity to update: ' + console.log(JSON.parse(JSON.stringify(component.get("v.opportunityFields")))));

        action.setParams({
            "opportunityToSave": component.get("v.opportunityFields")
        });
        console.log('Opportunity to update: ' + component.get("v.opportunityFields"));

        console.log('Opportunity param set');
        action.setCallback(this, function(response) {
            let state = response.getState();
            if (state === "SUCCESS"){
                console.log('Opportunity updated');
            }else{
                let error = response.getError();
                console.log("Failed with state: " + state + ' Error: ' + error[0].message + error[0].stackTrace);
            }
        });
        $A.enqueueAction(action);
    },

    saveShippingAddressToContact : function(component,event){
        if(component.get("v.opportunityFields.FF_Delivery__c")!='Personally'){
            console.log('Enter save to contact');
            let action = component.get("c.saveAddressToContact");
            console.log('Shipping street: ' + component.find("shippingAddress").get("v.street"));

            action.setParams({
                "street": component.find("shippingAddress").get("v.street"),
                "postal": component.find("shippingAddress").get("v.postalCode"),
                "city": component.find("shippingAddress").get("v.city"),
                "country": component.find("shippingAddress").get("v.country"),
                "state": component.find("shippingAddress").get("v.province")
            });

            console.log('Contact params set');
            action.setCallback(this, function(response) {
                let state = response.getState();
                if (state === "SUCCESS"){
                    console.log('Contact updated with address');
                }else{
                    let error = response.getError();
                    console.log("Failed with state: " + state + ' Error: ' + error[0].message + error[0].stackTrace);
                }
            });
            $A.enqueueAction(action);
        }
    },

    validateInputs : function(component,event){
        if(isEmpty(component.get("v.opportunityFields.FF_Delivery__c"))){
            component.set("v.inputsValid",false);
            let deliveryToast = $A.get("e.force:showToast");
            deliveryToast.setParams({
                "title": "Warning",
                "message": "Please choose delivery method first",
                "type": "warning"
            });
            deliveryToast.fire();
        }else if(isEmpty(component.get("v.opportunityFields.FF_Payment__c"))){
            component.set("v.inputsValid",false);
            let deliveryToast = $A.get("e.force:showToast");
            deliveryToast.setParams({
                "title": "Warning",
                "message": "Please choose payment method first",
                "type": "warning"
            });
            deliveryToast.fire();
        }else if(isEmpty(component.find("shippingAddress").get("v.street")) || isEmpty(component.find("shippingAddress").get("v.postalCode")) || isEmpty(component.find("shippingAddress").get("v.city"))){
            component.set("v.inputsValid",false);
            let deliveryToast = $A.get("e.force:showToast");
            deliveryToast.setParams({
                "title": "Warning",
                "message": "Please provide valid address for shipping",
                "type": "warning"
            });
            deliveryToast.fire();
        }else if(isEmpty(component.find("billingAddress").get("v.street")) || isEmpty(component.find("billingAddress").get("v.postalCode")) || isEmpty(component.find("billingAddress").get("v.city"))
            || isEmpty(component.find("companyName").get("v.value")) || isEmpty(component.find("taxNumber").get("v.value"))){
            if(component.get("v.opportunityFields.FF_Invoice__c")){
                component.set("v.inputsValid",false);
                let billingToast = $A.get("e.force:showToast");
                billingToast.setParams({
                    "title": "Warning",
                    "message": "Please provide all valid information for billing",
                    "type": "warning"
                });
                billingToast.fire();
            }
        }else{
            component.set("v.inputsValid",true);
        }

        function isEmpty(str) {
            if(str!=null){
                str.replace(' ','');
            }
            return (!str || str.length === 0 );
        }
    }

})