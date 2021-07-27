({

    doInit : function(component,event,helper){
        component.set("v.showSpinner",true);
        helper.checkApprovalPending(component,event);
        if(!component.get("v.isLocked")){
            helper.getImageLinkSuffix(component,event);
            helper.getPictures(component,event);
            let familyPicklistComponent = component.find("familyPicklist");
            familyPicklistComponent.getPicklistValuesForEdit(component.get("v.recordId"));
            helper.getProductPrice(component,event);
        }
    },

    handleSave: function(component, event, helper) {
        helper.saveProduct(component,event);
    },

    handleCancel : function(component,event,helper){
        let navEvt = $A.get("e.force:navigateToSObject");
        navEvt.setParams({
          "recordId": component.get("v.recordId"),
          "slideDevName": "related"
        });
        navEvt.fire();
    },

    handleDeleteNew : function(component,event,helper){
        helper.deleteNew(component,event);
    },

    handleDeleteCurrent : function(component,event,helper){
        helper.deleteCurrent(component,event);
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

    handleUpload : function(component,event,helper){
        let files = event.getSource().get("v.files");
        let fileWrappers = component.get("v.fileWrappers");
        for(let i = 0; i < files.length; i++){
            let fileReader = new FileReader();
            fileReader.readAsDataURL(files[i]);
            let isMain = false;
            if(component.get("v.currentFileWrappers").length==0 && i == 0){
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
        }
    }

})