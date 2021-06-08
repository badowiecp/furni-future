({

    getProducts: function(component, page, recordToDisplay) {

        // create a server-side action.
        let action = component.get("c.getProduct");
        // set the parameters to method
        action.setParams({
            "pageNumber": page,
            "recordToDisplay": recordToDisplay
        });

        action.setCallback(this, function(response) {
            // store the response
            let result = response.getReturnValue();

            try{
                result.forEach(function(record){
                                record.Product_Name_Link__c = "/" + record.Id;
                            });

            }catch(error){
                console.log(error.message);
            }


            // set the component attributes
            component.set("v.products", result.ProductListToDisplay);
            component.set("v.currentPage", result.pageNumber);
            component.set("v.totalRecords", result.totalRecords);
            component.set("v.totalPages", Math.ceil(result.totalRecords / recordToDisplay));

        });

        // enqueue the action
        $A.enqueueAction(action);
    }

})