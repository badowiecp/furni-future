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
               component.set("v.pictureId", response.getReturnValue());
               console.log('Picture Id: ' + component.get("v.pictureId"));
           }
       });
        $A.enqueueAction(action);
    }

})