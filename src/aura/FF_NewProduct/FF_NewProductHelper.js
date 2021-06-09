({

    getProductTemplate : function(component, event, recordTypeId){
        component.find("newProductData").getNewRecord(
            "Product2",
            recordTypeId,
            false,
            $A.getCallback(function() {
                var rec = component.get("v.newProduct");
                var error = component.get("v.newProductError");
                if(error || (rec === null)) {
                    console.log("Error initializing record template: " + error);
                    return;
                }
                console.log("Record template initialized: " + rec.apiName + ' ' + recordTypeId);
            })
        );
    },

    fetchListOfRecordTypes: function(component, event) {
       var action = component.get("c.fetchRecordTypeValues");
       action.setCallback(this, function(response) {
           let state = response.getState();
           console.log('Record type fetch state: ' + state);
           if (state === "SUCCESS"){
               component.set("v.recordTypes", response.getReturnValue());
               console.log(response.getReturnValue());
           }else{
               console.log("Failed with state: " + state);
           }
       });
       $A.enqueueAction(action);
    },

    saveImages : function(component,productId,files){
        let action = component.get("c.saveDocuments");
        action.setParams({
            "productId": productId,
            "files" : files,
        });
        console.log('Params set');
        action.setCallback(this, function(response) {
            let state = response.getState();
            if (state === "SUCCESS"){
                console.log('Successfully saved images')
                let navEvt = $A.get("e.force:navigateToSObject");
                navEvt.setParams({
                  "recordId": productId,
                  "slideDevName": "related"
                });
                component.set("v.showSpinner",false);
                navEvt.fire();
            }else{
                let error = response.getError();
                console.log("Failed with state: " + state + ' Error: ' + error[0].message + error[0].stackTrace);
            }
        });
        $A.enqueueAction(action);
    },

    deleteImage : function(component,event){
        let images = component.get("v.fileWrappers");
        let index = images.indexOf(event.getSource().get("v.value"));
        console.log('Index: ' + index);
        if (index > -1) {
          images.splice(index, 1);
        }
        component.set("v.fileWrappers",images);
    }

})