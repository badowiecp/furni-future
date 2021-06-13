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
                return;
                }
            })
        );
    },

    fetchListOfRecordTypes: function(component, event) {
       var action = component.get("c.fetchRecordTypeValues");
       action.setCallback(this, function(response) {
           let state = response.getState();
           if (state === "SUCCESS"){
               component.set("v.recordTypes", response.getReturnValue());
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
        action.setCallback(this, function(response) {
            let state = response.getState();
            if (state === "SUCCESS"){
                let navEvt = $A.get("e.force:navigateToSObject");
                navEvt.setParams({
                  "recordId": productId,
                  "slideDevName": "related"
                });
                component.set("v.showSpinner",false);
                navEvt.fire();
            }else{
                let resultsToast = $A.get("e.force:showToast");
                resultsToast.setParams({
                    "title": $A.get("$Label.FF_Error"),
                    "message": $A.get("$Label.FF_Could_not_save_uploaded_images"),
                    "type": "error"
                });
                resultsToast.fire();
            }
        });
        $A.enqueueAction(action);
    },

    deleteImage : function(component,event){
        let images = component.get("v.fileWrappers");
        let index = images.indexOf(event.getSource().get("v.value"));
        if (index > -1) {
          images.splice(index, 1);
        }
        component.set("v.fileWrappers",images);
    }

})