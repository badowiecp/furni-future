({

    getProductTemplate : function(component, event, recordTypeId){
        component.find("newProductData").getNewRecord(
            "Product2",
            recordTypeId,
            false,
            $A.getCallback(function() {
                let rec = component.get("v.newProduct");
                let error = component.get("v.newProductError");
                if(error || (rec === null)) {
                return;
                }
            })
        );
    },

    saveProductPrice : function(component,event,productId){
        let action = component.get("c.createStandardPricebookEntry");

        action.setParams({
            "productId" : productId,
            "productPrice" : component.get("v.productPrice")
        });

        action.setCallback(this, function(response){
            let state = response.getState();
            if (state !== "SUCCESS"){
                let errors = response.getError();
                let resultsToast = $A.get("e.force:showToast");
                resultsToast.setParams({
                    "title": $A.get("$Label.c.FF_Error"),
                    "message": errors[0].message,
                    "type": "error"
                });
                resultsToast.fire();
            }
        });
        $A.enqueueAction(action);
    },

    fetchListOfRecordTypes: function(component, event) {
       let action = component.get("c.fetchRecordTypeValues");
       action.setCallback(this, function(response) {
           let state = response.getState();
           if (state === "SUCCESS"){
               component.set("v.recordTypes", response.getReturnValue());
           }
       });
       $A.enqueueAction(action);
    },

    checkButtonVisibility : function(component,event){
        let action = component.get("c.checkIfAdmin");
        action.setCallback(this, function(response) {
            let state = response.getState();
            if (state === "SUCCESS"){
                component.set("v.showSaveButton", response.getReturnValue());
            }
        });
        $A.enqueueAction(action);
    },

    saveImages : function(component,productId,files){
        console.log('Enter save images');
        let action = component.get("c.saveDocuments");
        action.setParams({
            "productId": productId,
            "files" : files
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

    saveAndSendForApproval : function(component,event){
        let self = this;
        component.set("v.showSpinner",true);
        component.find("newProductData").saveRecord(function(saveResult) {
            if (saveResult.state === "SUCCESS" || saveResult.state === "DRAFT") {
                let resultsToast = $A.get("e.force:showToast");
                resultsToast.setParams({
                    "title": $A.get("$Label.c.FF_Saved"),
                    "message": $A.get("$Label.c.FF_The_record_was_saved"),
                    "type": "success"
                });
                let productId = saveResult.recordId;
                console.log('Product saved with Id: ' + productId);
                try{
                    self.saveImages(component,productId,component.get("v.fileWrappers"));
                    self.sendForApproval(component,event,productId);
                    resultsToast.fire();
                }catch(error){
                    console.log('Error: ' + error);
                }
            } else {
                let resultsToast = $A.get("e.force:showToast");
                resultsToast.setParams({
                    "title": $A.get("$Label.c.FF_Error"),
                    "message": $A.get("$Label.c.FF_Could_not_save_product"),
                    "type": "error"
                });
                resultsToast.fire();
            }
        });
    },

    sendForApproval : function(component,event,productId){
        let action = component.get("c.createProductApproval");

        action.setParams({
            "productId" : productId
        });

        console.log('Save to database params set');

        action.setCallback(this, function(response){
            let state = response.getState();
            if (state === "SUCCESS"){
                console.log('Request sent');
            }else{
                let errors = response.getError();
                let resultsToast = $A.get("e.force:showToast");
                resultsToast.setParams({
                    "title": $A.get("$Label.c.FF_Error"),
                    "message": errors[0].message,
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