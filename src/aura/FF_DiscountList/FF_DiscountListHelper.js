({

    prepareRowActions : function(component,event){
        let rowActions = this.getRowActions.bind(this, component);
        component.set('v.columns', [
            {label: $A.get("$Label.c.FF_Discounts"), fieldName: 'Name', type: 'text'},
            {label: $A.get("$Label.c.FF_Description"), fieldName: 'Description', type: 'text'},
            {label: $A.get("$Label.c.FF_Active"), fieldName: 'IsActive', type: 'boolean'},
            {label: $A.get("$Label.c.FF_Percentage_discount") + ' (%)', fieldName: 'Discount_Percent__c', type: 'number'},
            {type: "action", typeAttributes: { rowActions: rowActions }}
        ]);
    },

    getPriceBooks : function(component, page, recordToDisplay){
        let action = component.get("c.fetchPriceBooks");
        action.setParams({
            "pageNumber": page,
            "recordToDisplay": recordToDisplay
        });
        action.setCallback(this, function(response) {
            let state = response.getState();
            if (state === "SUCCESS"){
                let result = response.getReturnValue();
                component.set("v.priceBooksTable", result.pricebooks);
                component.set("v.currentPage", result.pageNumber);
                component.set("v.totalRecords", result.totalRecords);
                component.set("v.totalPages", Math.ceil(result.totalRecords / recordToDisplay));
            }else{
                let errors = response.getError();
                let toastEvent = $A.get("e.force:showToast");
                toastEvent.setParams({
                    title: $A.get("$Label.c.FF_Error"),
                    message: errors[0].message,
                    type: "error"
                });
                toastEvent.fire();
            }
        });
        $A.enqueueAction(action);
    },

    getRowIndex: function(rows, row) {
        let rowIndex = -1;
        rows.some(function(current, i) {
            if (current.id === row.id) {
                rowIndex = i;
                return true;
            }
        });
        return rowIndex;
    },

    getRowActions: function (cmp, row, doneCallback) {
        let actions = [{
            'label': $A.get("$Label.c.FF_View"),
            'name': 'view'
        },
        {
            'label': $A.get("$Label.c.FF_Edit"),
            'name': 'edit'
        }];

        if (row.IsActive) {
            actions.push({
                'label': $A.get("$Label.c.FF_Deactivate"),
                'name': 'deactivate'
            });
        } else {
            actions.push({
                'label': $A.get("$Label.c.FF_Activate"),
                'name': 'activate'
            });
        }

        setTimeout($A.getCallback(function () {
            doneCallback(actions);
        }), 200);
    },

    view : function(component, row){
        let modalBody;
        $A.createComponents([
            ["c:FF_DiscountView",{
                "pricebookId": row.Id,
            }]
        ],
        function(components, status){
            if (status === "SUCCESS") {
                modalBody = components[0];
                component.find('overlayLib').showCustomModal({
                   header: row.Name,
                   body: modalBody,
                   showCloseButton: true,
                   cssClass: "slds-modal_small",
                   closeCallback: function() {
                   }
                })
            }
        }
        );
    },

    edit : function(component, row){
        let navEvt = $A.get("e.force:navigateToComponent");
        navEvt.setParams({
            componentDef : "c:FF_EditDiscount",
            componentAttributes: {
                recordId : row.Id
            }
        });
        navEvt.fire();
    },

    redirectToNewDiscount : function(component,event){
        let navEvt = $A.get("e.force:navigateToComponent");
        navEvt.setParams({
            componentDef : "c:FF_NewDiscount"
        });
        navEvt.fire();
    },

    showActivationModal : function(component,row){
        let title;
        if(row.IsActive){
            title = $A.get("$Label.c.FF_Deactivate_discount");
        }else{
            title = $A.get("$Label.c.FF_Activate_discount");
        }
        let modalBody;
        let modalFooter;
        $A.createComponents([
            ["c:FF_DiscountActivationHandle",{
                "pricebookId": row.Id,
                "isActive": row.IsActive
            }]
        ],
        function(components, status){
            if (status === "SUCCESS") {
                modalBody = components[0];
                modalFooter = components[1];
                component.find('overlayLib').showCustomModal({
                   header: title,
                   body: modalBody,
                   footer: modalFooter,
                   showCloseButton: true,
                   cssClass: "slds-modal_small",
                   closeCallback: function() {
                   }
                })
            }
        }
        );
    }

})