({

    clearGlobal : function(component,event){
        component.find('globalDiscount').set("v.value",null);
    },

    cancel : function(component,event){
        let navEvt = $A.get("e.force:navigateToComponent");
        navEvt.setParams({
            componentDef : "c:FF_DiscountList"
        });
        navEvt.fire();
    },

    validateInputs : function(component,event){
        let anyChecked = false;
        let availableCheckboxes = component.find('checkbox');
        availableCheckboxes.forEach(function(checkbox) {
            if(checkbox.get("v.value")){
                anyChecked = true;
                return;
            }
        });
        if(isEmpty(component.get("v.priceBookFields.Name"))){
            component.set("v.inputsValid",false);
            this.fireToast($A.get("$Label.c.FF_Warning"),$A.get("$Label.c.FF_Please_specify_discount_name"),"warning");
        }else if(!anyChecked){
            component.set("v.inputsValid",false);
            this.fireToast($A.get("$Label.c.FF_Warning"),$A.get("$Label.c.FF_Please_choose_at_least_one_product_for_your_discount"),"warning");
        }else{
            let inputs = component.find('discountInput');
            let invalidNames = [];
            if(inputs){
                if(Array.isArray(inputs)){
                    inputs.forEach(function(inputs) {
                        if(inputs.get("v.value") == null || inputs.get("v.value") > 99 || inputs.get("v.value") < 1){
                            invalidNames.push(inputs.get("v.name"));
                        }
                    });
                }else{
                    if(inputs.get("v.value") == null || inputs.get("v.value") > 99 || inputs.get("v.value") < 1){
                        invalidNames.push(inputs.get("v.name"));
                    }
                }
                if(invalidNames.length > 0){
                    this.fireToast($A.get("$Label.c.FF_Warning"),$A.get("$Label.c.FF_Products_do_not_have_valid_discounts") + ": " + invalidNames.join(', '),"warning");
                }else{
                   component.set("v.inputsValid",true);
                }
            }
        }

        function isEmpty(str) {
            if(str!=null){
                str.replace(' ','');
            }
            return (!str || str.length === 0 );
        }
    },

    getAvailableProducts : function(component,event){
        let action = component.get("c.getEntriesForEdit");
        action.setParam("pricebookId",component.get("v.recordId"));
        action.setCallback(this, function(response) {
            let state = response.getState();
            if (state === "SUCCESS"){
                component.set("v.priceBookEntryWrappers", response.getReturnValue());
            }else{
                let errors = response.getError();
                self.fireToast($A.get("$Label.c.FF_Error"),errors[0].message,"error");
            }
        });
        $A.enqueueAction(action);
    },

    checkAll : function(component,event){
        let availableCheckboxes = component.find('checkbox');

        if(component.get("v.checkedAll")==false){
            event.getSource().set('v.value',false);
            availableCheckboxes.forEach(function(checkbox) {
                checkbox.set('v.value', false);
            });
        }else{
            event.getSource().set('v.value',true);
            availableCheckboxes.forEach(function(checkbox) {
                checkbox.set('v.value', true);
            });
        }
    },

    save : function(component,event,isActive){
        if(component.get("v.inputsValid")){
            component.set("v.showSpinner",true);
            let self = this;
            let discount = component.get("v.priceBookFields.Discount_Percent__c");
            component.set("v.priceBookFields.IsActive",isActive);

            component.find("priceBookEdit").saveRecord(function(saveResult) {
                if(saveResult.state === "SUCCESS" || saveResult.state === "DRAFT") {
                    let priceBookId = saveResult.recordId;
                    self.saveEntries(component,priceBookId,discount,isActive);
                }else{
                    self.fireToast($A.get("$Label.c.FF_Error"),JSON.stringify(saveResult.error),"error");
                    component.set("v.showSpinner",false);
                }
            });
        }
    },

    saveEntries : function(component,priceBookId,discount,isActive){
        let action = component.get("c.updatePriceBookEntries");
        let self = this;

        action.setParams({
            "wrappers": component.get("v.priceBookEntryWrappers"),
            "priceBookId": priceBookId,
            "discount": discount,
            "isActive": isActive
        });

        action.setCallback(this, function(response) {
            let state = response.getState();
            if (state === "SUCCESS"){
                self.fireToast($A.get("$Label.c.FF_Saved"),$A.get("$Label.c.FF_Discount_saved"),"success");

                let navEvt = $A.get("e.force:navigateToComponent");
                navEvt.setParams({
                    componentDef : "c:FF_DiscountList"
                });
                navEvt.fire();
            }else{
                let errors = response.getError();
                self.fireToast($A.get("$Label.c.FF_Error"),errors[0].message,"error","sticky");
            }
            component.set("v.showSpinner",false);
        });
        $A.enqueueAction(action);
    },

    changeGlobalDiscount : function(component,event){
        let inputs = component.find('discountInput');
        if(inputs){
            if(Array.isArray(inputs)){
                inputs.forEach(function(inputs) {
                    inputs.set('v.value', event.getSource().get("v.value"));
                });
            }else{
                inputs.set('v.value', event.getSource().get("v.value"));
            }
        }
    },

    fireToast : function(title,message,type,mode) {
        let toastEvent = $A.get("e.force:showToast");
        toastEvent.setParams({
            title: title,
            message: message,
            type: type,
            mode: mode
        });
        toastEvent.fire();
    }

})