({

    handleConfirm : function(component,event,helper){
        helper.toggleActive(component,event);
    },

    handleCancel : function (component, event, helper){
        component.find("overlayLib").notifyClose();
    }

})