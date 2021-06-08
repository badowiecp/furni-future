({

    doInit : function(component){
       let action = component.get("c.getDetailPictures");

       action.setParams({
           "productId": component.get("v.recordId")
       });

       action.setCallback(this, function(response) {
           let state = response.getState();
           if(component.isValid() && state === 'SUCCESS') {
               component.set("v.pictures", response.getReturnValue());
           }
       });
        $A.enqueueAction(action);
    }

})