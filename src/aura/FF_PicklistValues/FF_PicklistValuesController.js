({

//    doInit : function(component) {
//        console.log('Picklist init enter');
//
//        let action = component.get("c.getPicklistForRecordType");
//        action.setParams({
//            objectType: component.get("v.sObjectName"),
//            selectedField: component.get("v.fieldName")
//            recordTypeId: component.get("v.recordTypeId")
//        });
//
//        console.log('Picklist record type got: ' + component.get("v.recordTypeId"));
//
//        action.setCallback(this, function(response) {
//            console.log('Response status: ' + response.status);
//            let list = response.getReturnValue();
//            component.set("v.picklistValues", list);
//            console.log('Picklist retrieved: ' + list);
//        })
//        $A.enqueueAction(action);
//    },

//    doInit : function(component,event) {
//        console.log('Picklist init enter');
//        console.log('Picklist record type: ' + component.get("v.editRecordTypeId"));
//
//        let action = component.get("c.getPicklistForRecordType");
//        action.setParams({
//            recordTypeId: component.get("v.editRecordTypeId")
//        });
//
//        action.setCallback(this, function(response) {
//            console.log('Picklist init response status: ' + response.status);
//            let list = response.getReturnValue();
//            component.set("v.picklistValues", list);
//            console.log('Picklist retrieved: ' + list);
//        })
//        $A.enqueueAction(action);
//    },

    fetch : function(component,event) {
        console.log('Picklist fetch enter');
        let param = event.getParam("arguments");
        console.log('Picklist component received recordTypeId: ' + param.recordTypeId);

        let action = component.get("c.getPicklistForRecordType");
        action.setParams({
            recordTypeId: param.recordTypeId
        });

        console.log('Picklist record type got: ' + component.get("v.recordTypeId"));

        action.setCallback(this, function(response) {
            console.log('Response status: ' + response.status);
            let list = response.getReturnValue();
            component.set("v.picklistValues", list);
            console.log('Picklist retrieved: ' + list);
        })
        $A.enqueueAction(action);
    },

    fetchForEdit : function(component,event) {
        console.log('Picklist fetch for edit enter');
        let param = event.getParam("arguments");
        console.log('Picklist component received recordTypeId: ' + param.recordId);

        let action = component.get("c.getPicklistForRecordTypeForEdit");
        action.setParams({
            recordId: param.recordId
        });

        action.setCallback(this, function(response) {
            console.log('Response status: ' + response.status);
            let list = response.getReturnValue();
            component.set("v.picklistValues", list);
            console.log('Picklist retrieved: ' + list);
        })
        $A.enqueueAction(action);
    }

})