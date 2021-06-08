({

    navigateToNewProduct : function(component, event, helper) {
        var evt = $A.get("e.force:navigateToComponent");
        evt.setParams({
            componentDef : "c:FF_NewProduct",
        });
        evt.fire();
    }

})