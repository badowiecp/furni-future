({

    doInit : function(component,event,helper){
        helper.getPhotoId(component,event);
        helper.getProductPrice(component,event);
    },

    onClick : function(component, event, helper) {
        let navEvt = $A.get("e.force:navigateToSObject");
        navEvt.setParams({
          "recordId": component.get("v.productId"),
          "slideDevName": "related"
        });
        navEvt.fire();
    }

})