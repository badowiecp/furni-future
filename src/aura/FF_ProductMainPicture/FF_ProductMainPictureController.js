({

    doInit : function(component,event,helper){
        console.log('Enter main init');
       let action = component.get("c.getMainPicture");

       action.setParams({
           "productId": component.get("v.recordId")
       });

       console.log('Record Id: ' + component.get("v.recordId"));

       action.setCallback(this, function(response) {
           let state = response.getState();
           if(state === 'SUCCESS') {
               component.set("v.contentVersionId", response.getReturnValue());
               console.log('Picture Id: ' + component.get("v.contentVersionId"));
           }else{
               let error = response.getError();
               console.log("Failed with state: " + state + ' Error: ' + error[0].message);
           }
       });
        $A.enqueueAction(action);
    }

})