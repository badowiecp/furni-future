({

    doInit : function(component,event,helper){
       let action = component.get("c.getMainPicture");

       action.setParams({
           "productId": component.get("v.recordId")
       });

       action.setCallback(this, function(response) {
           let state = response.getState();
           if(state === 'SUCCESS') {
               component.set("v.contentVersionId", response.getReturnValue());
           }else{
               let error = response.getError();
           }
       });
        $A.enqueueAction(action);
    }

})