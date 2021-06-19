({

    prepareOpportunity : function(component,event){
        component.set("v.showSpinner",true);
        let action = component.get("c.getOpportunity");

        action.setParams({
            "opportunityId": component.get("v.opportunityId")
        });

        action.setCallback(this, function(response) {
            let state = response.getState();
            component.set("v.opportunityFields",response.getReturnValue());
            component.set("v.showSpinner",false);
        });
        $A.enqueueAction(action);
    },

    navigate : function(component,event){
        var navigate = component.get("v.navigateFlow");
        var action = event.getParam("action");

        if(action=='NEXT'){
            this.validateInputs(component,event);
            if(component.get("v.inputsValid")){
                component.set("v.showSpinner",true);
                this.saveShippingAddressToContact(component,event);
                this.saveDeliveryAndPaymentInfo(component,event);
                component.set("v.showSpinner",false);
                navigate(action);
            }
        }else{
            navigate(action);
        }
    },

    saveDeliveryAndPaymentInfo: function(component, event) {
        let action = component.get("c.saveOpportunity");

        action.setParams({
            "opportunityToSave": component.get("v.opportunityFields")
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

    saveShippingAddressToContact : function(component,event){
        if(component.get("v.opportunityFields.FF_Delivery__c")!='Personally'){
            let action = component.get("c.saveAddressToContact");

            action.setParams({
                "street": component.find("shippingAddress").get("v.street"),
                "postal": component.find("shippingAddress").get("v.postalCode"),
                "city": component.find("shippingAddress").get("v.city"),
                "country": component.find("shippingAddress").get("v.country"),
                "state": component.find("shippingAddress").get("v.province")
            });

            action.setCallback(this, function(response) {
                let state = response.getState();
                if (state === "ERROR"){
                    let errors = response.getError();
                    this.fireToast("Error",errors[0].message,"error");
                }
            });
            $A.enqueueAction(action);
        }
    },

    checkInvoice : function(component,event){
        component.set("v.invoice",event.getSource().get("v.value"));
    },

    validateInputs : function(component,event){
        if(isEmpty(component.get("v.opportunityFields.FF_Delivery__c"))){
            component.set("v.inputsValid",false);
            this.fireToast("Warning",$A.get("$Label.c.FF_Please_choose_delivery_method_first"),"warning");
        }else if(isEmpty(component.get("v.opportunityFields.FF_Payment__c"))){
            component.set("v.inputsValid",false);
            this.fireToast("Warning",$A.get("$Label.c.FF_Please_choose_payment_method_first"),"warning");
        }else if(isEmpty(component.find("shippingAddress").get("v.street")) || isEmpty(component.find("shippingAddress").get("v.postalCode")) || isEmpty(component.find("shippingAddress").get("v.city"))){
            component.set("v.inputsValid",false);
            this.fireToast("Warning",$A.get("$Label.c.FF_Please_provide_valid_address_for_shipping"),"warning");
        }else if(component.get("v.opportunityFields.FF_Invoice__c") && (isEmpty(component.find("billingAddress").get("v.street")) || isEmpty(component.find("billingAddress").get("v.postalCode")) || isEmpty(component.find("billingAddress").get("v.city")) || isEmpty(component.find("companyName").get("v.value")) || isEmpty(component.find("taxNumber").get("v.value")))){
            component.set("v.inputsValid",false);
            this.fireToast("Warning",$A.get("$Label.c.FF_Please_provide_all_valid_information_for_billing"),"warning");
        }else{
            component.set("v.inputsValid",true);
        }

        function isEmpty(str) {
            if(str!=null){
                str.replace(' ','');
            }
            return (!str || str.length === 0 );
        }
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