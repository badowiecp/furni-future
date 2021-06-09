({

    onProductSearch : function(component,event,helper){
        console.log('Event received');
        let query = event.getParam("query");
        let recordType = event.getParam("recordType");
        let productFamily = event.getParam("productFamily");
        console.log('ProductSearch query ' + query);
        console.log('ProductSearch recordType ' + recordType);
        console.log('ProductSearch productFamily ' + productFamily);

        let searchResultsComponent = component.find("productSearchResults");
        searchResultsComponent.search(query,recordType,productFamily);

        console.log('onProductSearch exit');
    }

})