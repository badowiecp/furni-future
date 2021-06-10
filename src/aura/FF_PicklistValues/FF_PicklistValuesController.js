({

    doInit : function(component,event,helper){

        let action = component.get("c.getPickListValuesAsList");
        action.setParams({
            objectType: component.get("v.sObjectName"),
            selectedField: component.get("v.fieldName"),
        });

        action.setCallback(this, function(response) {
            let state = response.getState();
            if (state === "SUCCESS"){
                let list = response.getReturnValue();
                component.set("v.picklistValues", list);
            }
        })
        $A.enqueueAction(action);
    },

    fetch : function(component,event) {
        let param = event.getParam("arguments");

        let action = component.get("c.getPicklistForRecordType");
        action.setParams({
            recordTypeId: param.recordTypeId
        });

        action.setCallback(this, function(response) {
            let list = response.getReturnValue();
            component.set("v.picklistValues", list);
        })
        $A.enqueueAction(action);
    },

    fetchForEdit : function(component,event) {
        let param = event.getParam("arguments");

        let action = component.get("c.getPicklistForRecordTypeForEdit");
        action.setParams({
            recordId: param.recordId
        });

        action.setCallback(this, function(response) {
            let list = response.getReturnValue();
            component.set("v.picklistValues", list);
        })
        $A.enqueueAction(action);
    },

})