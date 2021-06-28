({

    handleClose : function(component, event, helper) {
        component.find("overlayLib").notifyClose();
    },

    handleConfirm : function(component, event, helper) {
        helper.redirectToConfirmOrder(component,event);
    }

})