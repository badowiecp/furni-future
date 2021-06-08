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
               console.log(component.get("v.currentFileWrappers"));
           }
       });
       $A.enqueueAction(action);
    },

    deleteImages : function (component,event){
        let action = component.get("c.deleteDocuments");

        action.setParams({
            "contentVersionIds": component.get("v.imagesToDelete")
        });

        action.setCallback(this, function(response) {
            let state = response.getState();
            if(component.isValid() && state === 'SUCCESS') {
                console.log('Images deleted');
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
        console.log('ProductId: ' + component.get("v.recordId"));
        console.log(files.length);
        console.log('Params set');
        action.setCallback(this, function(response) {
            let state = response.getState();
            if (state === "SUCCESS"){
                console.log('Successfully saved images')
            }else{
                let error = response.getError();
                console.log("Failed with state: " + state + ' Error: ' + error[0].message + error[0].stackTrace);
            }
        });
        $A.enqueueAction(action);
    },

    deleteCurrent : function(component,event){
        let imagesToDelete = component.get("v.imagesToDelete");
        let imageId = event.getSource().get("v.value.contentVersionId");
        console.log('Image Id: ' + imageId);
        imagesToDelete.push(imageId);
        component.set("v.imagesToDelete",imagesToDelete);
        let currentImages = component.get("v.currentFileWrappers");
        let index = currentImages.indexOf(event.getSource().get("v.value"));
        console.log('Index: ' + index);
        if (index > -1) {
          currentImages.splice(index, 1);
        }
        component.set("v.currentFileWrappers",currentImages);
    },

    deleteNew : function(component,event){
        let images = component.get("v.fileWrappers");
        let index = images.indexOf(event.getSource().get("v.value"));
        console.log('Index: ' + index);
        if (index > -1) {
          images.splice(index, 1);
        }
        component.set("v.fileWrappers",images);
    }

})