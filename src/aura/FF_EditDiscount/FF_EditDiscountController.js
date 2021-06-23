({

    init : function(component,event,helper){
        helper.getAvailableProducts(component,event);
    },

    handleAddToDiscount : function(component,event,helper){
        helper.addToDiscount(component,event);
    },

    handleAddAll : function(component,event,helper){
        helper.checkAll(component,event);
    },

    handleSave : function(component, event, helper){
        helper.validateInputs(component,event);
        helper.save(component,event,false);
    },

    handleSaveAndActivate : function(component,event,helper){
        helper.validateInputs(component,event);
        helper.save(component,event,true);
    },

    handleCancel : function(component,event,helper){
        helper.cancel(component,event);
    }

})