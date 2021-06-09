({

    fetchListOfRecordTypes : function(component, event) {
       let action = component.get("c.fetchRecordTypeValues");
       action.setCallback(this, function(response) {
           let state = response.getState();
           console.log('Record type fetch state: ' + state);
           if (state === "SUCCESS"){
               component.set("v.recordTypes", response.getReturnValue());
               console.log(response.getReturnValue());
           }else{
               console.log("Failed with state: " + state);
           }
       });
       $A.enqueueAction(action);
    },

    search : function(component){
        let query = component.get("v.query");
        console.log('SearchFormHelper enter');
        let searchEvent = component.getEvent("Search");
        console.log('Event got: ' + searchEvent);
        console.log('Event set query: ' + query);
        console.log('Event set recordType: ' + component.get("v.selectedRecordType"));
        console.log('Event set productFamily: ' + component.get("v.selectedProductFamily"));
        searchEvent.setParam("query",query);
        searchEvent.setParam("recordType",component.get("v.selectedRecordType"));
        searchEvent.setParam("productFamily",component.get("v.selectedProductFamily"));
        searchEvent.fire();
    }

})