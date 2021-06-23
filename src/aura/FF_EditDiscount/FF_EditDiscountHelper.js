({

    addToDiscount : function(component,event){
        if(component.get("v.checkedAll")==true && event.getSource().get("v.value") == false){
        }
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
            this.fireToast("Warning",$A.get("$Label.c.FF_Please_specify_discount_name"),"warning");
        }else if(component.get("v.priceBookFields.Discount_Percent__c") > 99 || component.get("v.priceBookFields.Discount_Percent__c") < 1){
            component.set("v.inputsValid",false);
            this.fireToast("Warning",$A.get("$Label.c.FF_Please_insert_valid_number_less_than_100_and_greater_than_0"),"warning");
        }else if(!anyChecked){
            component.set("v.inputsValid",false);
            this.fireToast("Warning",$A.get("$Label.c.FF_Please_choose_at_least_one_product_for_your_discount"),"warning");
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

    getAvailableProducts : function(component,event){
        let action = component.get("c.getEntriesForEdit");

        action.setParams({
            "pricebookId": component.get("v.recordId")
        });

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
                if (saveResult.state === "SUCCESS" || saveResult.state === "DRAFT") {
                    let priceBookId = saveResult.recordId;
                    self.saveEntries(component,priceBookId,discount,isActive);
                } else {
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