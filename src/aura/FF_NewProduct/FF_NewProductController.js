({

    doInit: function(component, event, helper) {
        helper.fetchListOfRecordTypes(component,event);
    },

    handleSave : function(component, event, helper){
        component.set("v.showSpinner",true);
        component.find("newProductData").saveRecord(function(saveResult) {
            if (saveResult.state === "SUCCESS" || saveResult.state === "DRAFT") {
                // record is saved successfully
                let resultsToast = $A.get("e.force:showToast");
                resultsToast.setParams({
                    "title": "Saved",
                    "message": "The record was saved."
                });

                let productId = saveResult.recordId;
                helper.saveImages(component,productId,component.get("v.fileWrappers"));
                resultsToast.fire();

            } else if (saveResult.state === "INCOMPLETE") {
                console.log("User is offline, device doesn't support drafts.");
            } else if (saveResult.state === "ERROR") {
                console.log('Problem saving contact, error: ' + JSON.stringify(saveResult.error));
            } else {
                console.log('Unknown problem, state: ' + saveResult.state + ', error: ' + JSON.stringify(saveResult.error));
            }
        });
    },

    handleCancel : function (component, event, helper){
        component.find("overlayLib").notifyClose();
        console.log('Modal closed');
    },

    handleNext : function (component, event, helper){
        let recordTypeLabel = component.find("selectid").get("v.value");
        component.set("v.recordTypeSelect",recordTypeLabel);

        let action = component.get("c.getRecTypeId");
        action.setParams({
            "recordTypeLabel" : component.get("v.recordTypeSelect")
        });
        console.log('Params set: ' + component.get("v.recordTypeSelect"));
        action.setCallback(this, function(response) {

            let state = response.getState();

            if (state === "SUCCESS"){
                let recordTypeId = response.getReturnValue();
                let familyPicklistComponent = component.find("familyPicklist");
                helper.getProductTemplate(component,event,recordTypeId);
                try{
                    familyPicklistComponent.getPicklistValues(recordTypeId);
                }catch(error){
                    console.log(error);
                }
                console.log('familyPicklistComponent: ' +  recordTypeId);
            }else{
                console.log("Failed with state: " + state);
            }
        });
        $A.enqueueAction(action);
    },

    handleUpload : function(component,event,helper){
        let files = event.getSource().get("v.files");
        console.log(files);
        let fileWrappers = component.get("v.fileWrappers");
        console.log('Empty fileWrappers array: ' + fileWrappers);
        for(let i = 0; i < files.length; i++){
            let fileReader = new FileReader();
            fileReader.readAsDataURL(files[i]);
            let isMain = false;
            if(i==0){
                isMain = true;
            }
            fileReader.onload = function () {
                let fileContentBase64 = fileReader.result.split('base64,')[1];
                fileWrappers.push({
                    "fileName" : files[i].name,
                    "fileBody" : fileContentBase64,
                    "filePreview" : URL.createObjectURL(files[i]),
                    "isMain" : isMain
                });
                console.log(JSON.parse(JSON.stringify(fileWrappers)))
                component.set("v.fileWrappers",fileWrappers);
            }
        }
        console.log('Files loaded: ' + component.get("v.fileWrappers"));
    },

    handleSetMain : function(component,event,helper){
        //Gets the checkbox group based on the checkbox id
        let availableCheckboxes = component.find('checkbox');
        let resetCheckboxValue  = false;
        if (Array.isArray(availableCheckboxes)) {
            //If more than one checkbox available then individually resets each checkbox
            availableCheckboxes.forEach(function(checkbox) {
                checkbox.set('v.value', resetCheckboxValue);
            });
        } else {
            //if only one checkbox available then it will be unchecked
            availableCheckboxes.set('v.value', resetCheckboxValue);
        }
        //mark the current checkbox selection as checked
        event.getSource().set("v.value",true);
    },

    handleDelete : function(component,event,helper){
        helper.deleteImage(component,event);
    }

})