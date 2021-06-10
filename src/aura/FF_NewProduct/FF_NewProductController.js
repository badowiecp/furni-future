({

    doInit: function(component, event, helper) {
        helper.fetchListOfRecordTypes(component,event);
    },

    handleSave : function(component, event, helper){
        component.set("v.showSpinner",true);
        component.find("newProductData").saveRecord(function(saveResult) {
            if (saveResult.state === "SUCCESS" || saveResult.state === "DRAFT") {
                let resultsToast = $A.get("e.force:showToast");
                resultsToast.setParams({
                    "title": $A.get("$Label.c.FF_Saved"),
                    "message": $A.get("$Label.c.FF_The_record_was_saved")
                });
                let productId = saveResult.recordId;
                helper.saveImages(component,productId,component.get("v.fileWrappers"));
                resultsToast.fire();
            } else {
                let resultsToast = $A.get("e.force:showToast");
                resultsToast.setParams({
                    "title": $A.get("$Label.c.FF_Error"),
                    "message": $A.get("$Label.c.FF_Could_not_save_product")
                });
                resultsToast.fire();
            }
        });
    },

    handleCancel : function (component, event, helper){
        component.find("overlayLib").notifyClose();
    },

    handleNext : function (component, event, helper){
        let recordTypeLabel = component.find("selectid").get("v.value");
        if(recordTypeLabel!=null && recordTypeLabel!=''){
            component.set("v.recordTypeSelect",recordTypeLabel);

            let action = component.get("c.getRecTypeId");
            action.setParams({
                "recordTypeLabel" : component.get("v.recordTypeSelect")
            });
            action.setCallback(this, function(response) {

                let state = response.getState();

                if (state === "SUCCESS"){
                    let recordTypeId = response.getReturnValue();
                    let familyPicklistComponent = component.find("familyPicklist");
                    helper.getProductTemplate(component,event,recordTypeId);
                    familyPicklistComponent.getPicklistValues(recordTypeId);
                }
            });
            $A.enqueueAction(action);
        }else{
            let resultsToast = $A.get("e.force:showToast");
            resultsToast.setParams({
                "title": $A.get("$Label.c.FF_Error"),
                "message": $A.get("$Label.c.FF_Please_select_space_type_first"),
                "type": "warning"
            });
            resultsToast.fire();
        }
    },

    handleUpload : function(component,event,helper){
        let files = event.getSource().get("v.files");
        let fileWrappers = [];
        for(let i = 0; i < files.length; i++){
            let fileReader = new FileReader();
            try{
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
                    component.set("v.fileWrappers",fileWrappers);
                }
            }catch(error){
                let resultsToast = $A.get("e.force:showToast");
                resultsToast.setParams({
                    "title": $A.get("$Label.c.FF_Error"),
                    "message": $A.get("$Label.c.FF_Could_not_process_file") + " " + files[i].name,
                    "type": "error"
                });
                resultsToast.fire();
            }
        }
    },

    handleSetMain : function(component,event,helper){
        let availableCheckboxes = component.find('checkbox');
        let resetCheckboxValue  = false;
        if (Array.isArray(availableCheckboxes)) {
            availableCheckboxes.forEach(function(checkbox) {
                checkbox.set('v.value', resetCheckboxValue);
            });
        } else {
            availableCheckboxes.set('v.value', resetCheckboxValue);
        }
        event.getSource().set("v.value",true);
    },

    handleDelete : function(component,event,helper){
        helper.deleteImage(component,event);
    }

})