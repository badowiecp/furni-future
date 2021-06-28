({

    doInit : function(component, event, helper) {
        helper.getProducts(component, '', '', '', 1, component.get("v.recordsPerPage"));
    }

})