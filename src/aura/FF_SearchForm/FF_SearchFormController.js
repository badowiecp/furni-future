({

    doInit: function(component, event, helper) {
        helper.fetchListOfRecordTypes(component,event);
    },

    onSearch : function(component,event,helper){
        helper.search(component);
    },

    handleRecordTypeSelect : function(component,event,helper){
        console.log('Enter record type select');
        let recordType = component.find("recordTypeSelect").get("v.value");
        component.set("v.selectedRecordType",recordType);
        console.log(component.get("v.selectedRecordType"));
    },

    handleProductFamilySelect : function(component,event,helper){
        console.log('Enter product family select');
        let productFamily = component.find("productFamilySelect").get("v.value");
        component.set("v.selectedProductFamily",productFamily);
        console.log(component.get("v.selectedProductFamily"));
    }





})