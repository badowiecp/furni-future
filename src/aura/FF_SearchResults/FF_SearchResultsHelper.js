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
                console.log('Products list: ' + productsResponse.records);
                console.log('Total pages: ' + component.get("v.totalPages"));
                console.log('Total records: ' + component.get("v.totalRecords"));
                console.log('Records per page: ' + recordsPerPage);
                component.set("v.showSpinner", false);
            }else{
                let error = response.getError();
                console.log("Failed with state: " + state + ' Error: ' + error[0].message);
            }
        });
        $A.enqueueAction(action);
    }

})