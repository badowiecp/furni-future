({

    getPriceBooks : function(component,event){
        var action = component.get("c.fetchPriceBooks");
        action.setCallback(this, function(response) {
            let state = response.getState();
            if (state === "SUCCESS"){
                component.set("v.priceBooksTable", response.getReturnValue());
                component.set("v.priceBooks", response.getReturnValue());
            }
        });
        $A.enqueueAction(action);
    },

    getRowIndex: function(rows, row) {
        var rowIndex = -1;
        rows.some(function(current, i) {
            if (current.id === row.id) {
                rowIndex = i;
                return true;
            }
        });
        return rowIndex;
    },

    getRowActions: function (cmp, row, doneCallback) {
        var actions = [{
            'label': 'Edit',
            'name': 'edit'
        }];

        if (row.IsActive) {
            actions.push({
                'label': 'Deactivate',
                'name': 'deactivate'
            });
        } else {
            actions.push({
                'label': 'Activate',
                'name': 'activate'
            });
        }

        setTimeout($A.getCallback(function () {
            doneCallback(actions);
        }), 200);
    },

    edit : function(component,event){
        let navEvt = $A.get("e.force:navigateToComponent");
        navEvt.setParams({
            componentDef : "c:FF_EditProduct"
//            componentAttributes: {
//                contactId : component.get("v.contact.Id")
//            }
        });
        navEvt.fire();
    },

    activate : function(component,event){
        let modalBody;
        let modalFooter;
        $A.createComponents([
            ["c:FF_NewProduct",{}]
        ],
        function(components, status){
            if (status === "SUCCESS") {
                modalBody = components[0];
                modalFooter = components[1];
                component.find('overlayLib').showCustomModal({
                   header: "Activate discount",
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
    },

    deactivate : function(component,event){
        let modalBody;
        let modalFooter;
        $A.createComponents([
            ["c:FF_NewProduct",{}]
        ],
        function(components, status){
            if (status === "SUCCESS") {
                modalBody = components[0];
                modalFooter = components[1];
                component.find('overlayLib').showCustomModal({
                   header: "Deactivate discount",
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