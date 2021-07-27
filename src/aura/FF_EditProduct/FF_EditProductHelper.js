({

    getPictures : function (component,event){
       let action = component.get("c.getCurrentFileWrappers");

       action.setParams({
           "productId": component.get("v.recordId")
       });

       action.setCallback(this, function(response) {
           let state = response.getState();
           if(component.isValid() && state === 'SUCCESS') {
               component.set("v.currentFileWrappers", response.getReturnValue());
           }
       });
       $A.enqueueAction(action);
    },

    checkApprovalPending : function(component,event){
        let action = component.get("c.checkIfLocked");

        action.setParams({
            "productId": component.get("v.recordId")
        });

        action.setCallback(this, function(response) {
            component.set("v.isLocked", response.getReturnValue());
            component.set("v.showSpinner",false);
        });
        $A.enqueueAction(action);
    },

    getImageLinkSuffix : function (component,event){
       let action = component.get("c.queryImageLinkSuffix");

       action.setCallback(this, function(response) {
           let state = response.getState();
           if(component.isValid() && state === 'SUCCESS') {
               component.set("v.imageLinkSuffix", response.getReturnValue());
           }
       });
       $A.enqueueAction(action);
    },

    getProductPrice : function(component,event){
        let action = component.get("c.getStandardPriceBookEntry");

        action.setParams({
            "productId": component.get("v.recordId")
        });

        action.setCallback(this, function(response) {
            let state = response.getState();
            component.set("v.currentPrice",response.getReturnValue().UnitPrice);
            component.set("v.productPrice",response.getReturnValue());
        });
        $A.enqueueAction(action);
    },

    saveProductPrice : function(component,event){
        let action = component.get("c.saveStandardPricebookEntry");

        action.setParams({
            "pricebookEntry": component.get("v.productPrice")
        });

        action.setCallback(this, function(response) {
            let state = response.getState();
            if(state !== 'SUCCESS'){
                console.log('ERROR: ' + response.getError());
            }
        });
        $A.enqueueAction(action);
    },

    saveProduct : function(component,event){
        let self = this;
        component.set("v.showSpinner",true);
        let productEdit = component.find("productEdit");
        productEdit.saveRecord($A.getCallback(function(saveResult) {
            if (saveResult.state === "SUCCESS" || saveResult.state === "DRAFT") {
                if(component.get("v.imagesToDelete").length>0){
                    self.deleteImages(component,event);
                }
                self.saveImages(component,component.get("v.fileWrappers"));
                self.setMain(component);
                console.log(component.get("v.productPrice.UnitPrice"));
                console.log(component.get("v.currentPrice"));
                if(component.get("v.productPrice.UnitPrice")!=component.get("v.currentPrice")){
                    self.saveProductPrice(component,event);
                }
                self.fireToast($A.get("$Label.FF_Success"),"Changes saved","success");
            } else {
                self.fireToast($A.get("$Label.FF_Error"),$A.get("$Label.FF_Error_saving_product"),"error");
            }
            component.set("v.showSpinner",false);
        }));
    },

    deleteImages : function (component,event){
        let action = component.get("c.deleteDocuments");

        action.setParams({
            "contentVersionIds": component.get("v.imagesToDelete")
        });

        action.setCallback(this, function(response) {
            let state = response.getState();
            if(state != 'SUCCESS') {
                let resultsToast = $A.get("e.force:showToast");
                resultsToast.setParams({
                    "title": $A.get("$Label.FF_Error"),
                    "message": $A.get("$Label.FF_Could_not_delete_image"),
                    "type": "error"
                });
                resultsToast.fire();
            }
        });
        $A.enqueueAction(action);
    },

    saveImages : function(component,files){
        let action = component.get("c.saveDocuments");
        action.setParams({
            "productId": component.get("v.recordId"),
            "files" : files,
        });
        action.setCallback(this, function(response) {
            let state = response.getState();
            if (state != "SUCCESS"){
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

    deleteCurrent : function(component,event){
        let imagesToDelete = component.get("v.imagesToDelete");
        let imageId = event.getSource().get("v.value.contentVersionId");
        imagesToDelete.push(imageId);
        component.set("v.imagesToDelete",imagesToDelete);
        let currentImages = component.get("v.currentFileWrappers");
        let index = currentImages.indexOf(event.getSource().get("v.value"));
        if (index > -1) {
          currentImages.splice(index, 1);
        }
        component.set("v.currentFileWrappers",currentImages);
    },

    deleteNew : function(component,event){
        let images = component.get("v.fileWrappers");
        let index = images.indexOf(event.getSource().get("v.value"));
        if (index > -1) {
          images.splice(index, 1);
        }
        component.set("v.fileWrappers",images);
    },

    setMain : function(component,event){
        let action = component.get("c.setMainContentVersion");
        action.setParams({
            "productId": component.get("v.recordId"),
            "files": component.get("v.currentFileWrappers")
        });
        action.setCallback(this, function(response) {
            let state = response.getState();
            if (state === "SUCCESS"){
                let navEvt = $A.get("e.force:navigateToSObject");
                navEvt.setParams({
                  "recordId": component.get("v.recordId"),
                  "slideDevName": "related"
                });
                navEvt.fire();
            }
        });
        $A.enqueueAction(action);
    },

    fireToast : function(title,message,type) {
        let toastEvent = $A.get("e.force:showToast");
        toastEvent.setParams({
            title: title,
            message: message,
            type: type
        });
        toastEvent.fire();
    }

})