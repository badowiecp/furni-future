({

    getProducts: function(component, page, recordToDisplay) {
        let action = component.get("c.getProduct");
        action.setParams({
            "pageNumber": page,
            "recordToDisplay": recordToDisplay
        });

        action.setCallback(this, function(response) {
            let result = response.getReturnValue();
            for (let i = 0; i < result.ProductListToDisplay.length; i++) {
                let record = result.ProductListToDisplay[i];
                if (record.product.RecordType.Name) record.product.Record_Type_Name__c = record.product.RecordType.Name;
            }
            component.set("v.products", result.ProductListToDisplay);
            component.set("v.currentPage", result.pageNumber);
            component.set("v.totalRecords", result.totalRecords);
            component.set("v.totalPages", Math.ceil(result.totalRecords / recordToDisplay));
        });
        $A.enqueueAction(action);
    }

})