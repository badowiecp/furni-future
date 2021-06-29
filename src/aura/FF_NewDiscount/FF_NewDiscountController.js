({

    init : function(component,event,helper){
        helper.getRecordTemplate(component,event);
        helper.getAvailableProducts(component,event);
    },

    handleChangeInput : function(component,event,helper){
        helper.clearGlobal(component,event);
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
    },

    handleChangeGlobalDiscount : function(component,event,helper){
        helper.changeGlobalDiscount(component,event);
    }

})