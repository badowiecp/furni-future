({
    init: function(component, event, helper) {
        helper.captureWarehouseId(component,event);
        helper.setTabName(component,event);
    },

    reInit : function(component, event, helper) {
        $A.get('e.force:refreshView').fire();
    }
})