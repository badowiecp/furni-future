({

    fetchListOfRecordTypes : function(component, event) {
       let action = component.get("c.fetchRecordTypeValues");
       action.setCallback(this, function(response) {
           let state = response.getState();
           if (state === "SUCCESS"){
               component.set("v.recordTypes", response.getReturnValue());
           }else{
               console.log("Failed with state: " + state);
           }
       });
       $A.enqueueAction(action);
    },

    search : function(component){
        let query = component.get("v.query");
        let searchEvent = component.getEvent("Search");
        searchEvent.setParam("query",query);
        searchEvent.setParam("recordType",component.get("v.selectedRecordType"));
        searchEvent.setParam("productFamily",component.get("v.selectedProductFamily"));
        searchEvent.fire();
    }

})