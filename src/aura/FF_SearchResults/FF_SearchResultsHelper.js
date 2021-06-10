({

    getProducts : function(component, query, recordType, productFamily, page, recordsPerPage){
        component.set("v.showSpinner", true);
        let action = component.get("c.getProductList");
        action.setParams({
            "query" : query,
            "pageNumber" : page,
            "recordsPerPage" : recordsPerPage,
            "recordType" : recordType,
            "productFamily" : productFamily
        });

        action.setCallback(this, function(response){
            let state = response.getState();
            if (state === "SUCCESS"){
                let productsResponse = response.getReturnValue();
                component.set("v.products",productsResponse.records);
                component.set("v.pageNumber",productsResponse.pageNumber);
                component.set("v.totalPages",Math.ceil(productsResponse.totalRecords / recordsPerPage));
                component.set("v.totalRecords",productsResponse.totalRecords);
                component.set("v.showSpinner", false);
            }else{
                let error = response.getError();
                let resultsToast = $A.get("e.force:showToast");
                resultsToast.setParams({
                    "title": $A.get("$Label.FF_Error"),
                    "message": error[0].message,
                    "type": "error"
                });
                resultsToast.fire();
            }
        });
        $A.enqueueAction(action);
    }

})