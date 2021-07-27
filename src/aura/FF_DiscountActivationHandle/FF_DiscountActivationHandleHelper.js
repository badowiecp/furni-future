({

    toggleActive : function(component,event){
        let action = component.get("c.togglePriceBookActive");
        let self = this;

        action.setParams({
            "pricebookId": component.get("v.pricebookId"),
            "isActive": component.get("v.isActive")
        });

        action.setCallback(this, function(response) {
            let state = response.getState();
            if (state === "SUCCESS"){
                if(component.get("v.isActive")){
                    self.fireToast($A.get("$Label.c.FF_Success"),$A.get("$Label.c.FF_Discount_deactivated"),"success");
                }else{
                    self.fireToast($A.get("$Label.c.FF_Success"),$A.get("$Label.c.FF_Discount_activated"),"success");
                }
                component.find("overlayLib").notifyClose();
                window.location.reload();
            }else{
                let errors = response.getError();
                if(component.get("v.isActive")){
                    self.fireToast($A.get("$Label.c.FF_Error"),$A.get("$Label.c.FF_Cannot_deactivate_discount") + ': ' + errors[0].message,"error","sticky");
                }else{
                    self.fireToast($A.get("$Label.c.FF_Error"),$A.get("$Label.c.FF_Cannot_activate_discount") + ': ' + errors[0].message,"error","sticky");
                }
            }
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