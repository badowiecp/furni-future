({

    onProductSearch : function(component,event,helper){
        let query = event.getParam("query");
        let recordType = event.getParam("recordType");
        let productFamily = event.getParam("productFamily");

        let searchResultsComponent = component.find("productSearchResults");
        searchResultsComponent.search(query,recordType,productFamily);
    }

})