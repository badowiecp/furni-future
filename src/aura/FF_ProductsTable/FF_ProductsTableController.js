({

    init: function (component, event, helper) {
        component.set('v.columns', [
            {label: 'Product Name', fieldName: 'Product_Name_Link__c', type: 'url', typeAttributes: {label: { fieldName: 'Name' }, target: '_blank'}},
            {label: 'Space Type', fieldName: 'Record_Type_Name__c', type: 'text'},
            {label: 'Product Type', fieldName: 'Family', type: 'text'},
            {label: 'Description', fieldName: 'Description', type: 'text'},
        ]);

        let page = component.get("v.currentPage");
        let recordToDisplay = component.find("recordSize").get("v.value");
        helper.getProducts(component, page, recordToDisplay);
    },

    navigate: function(component, event, helper) {
        let page = component.get("v.currentPage") || 1;
        let direction = event.getSource().get("v.label");
        let recordToDisplay = component.find("recordSize").get("v.value");
        page = direction === "Previous Page" ? (page - 1) : (page + 1);
        helper.getProducts(component, page, recordToDisplay);
    },

    navigateToFirst: function(component, event, helper) {
        let recordToDisplay = component.find("recordSize").get("v.value");
        helper.getProducts(component, 1, recordToDisplay);
    },

    navigateToLast: function(component, event, helper) {
       let recordToDisplay = component.find("recordSize").get("v.value");
       helper.getProducts(component, component.get("v.totalPages"), recordToDisplay);
    },

    onSelectChange: function(component, event, helper) {
        let page = 1
        let recordToDisplay = component.find("recordSize").get("v.value");
        helper.getProducts(component, page, recordToDisplay);
    },

    handleShowModal: function(component, event, helper) {
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
                   header: "New Product",
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