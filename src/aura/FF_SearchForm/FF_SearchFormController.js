({

    doInit: function(component, event, helper) {
        helper.fetchListOfRecordTypes(component,event);
    },

    onSearch : function(component,event,helper){
        helper.search(component);
    },

    handleRecordTypeSelect : function(component,event,helper){
        let recordType = component.find("recordTypeSelect").get("v.value");
        component.set("v.selectedRecordType",recordType);
    },

    handleProductFamilySelect : function(component,event,helper){
        let productFamily = component.find("productFamilySelect").get("v.value");
        component.set("v.selectedProductFamily",productFamily);
    }

})