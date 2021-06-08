({

    init: function (component, event, helper) {
        component.set('v.columns', [
            {label: 'Product Name', fieldName: 'Product_Name_Link__c', type: 'url', typeAttributes: {label: { fieldName: 'Name' }, target: '_blank'}},
            {label: 'Product Code', fieldName: 'ProductCode', type: 'text'},
            {label: 'Description', fieldName: 'Description', type: 'text'},
        ]);

        //Check if the page is select or not, Default 1
        let page = component.get("v.currentPage");
        //Get selected the value
        let recordToDisplay = component.find("recordSize").get("v.value");
        // call the helper function
        helper.getProducts(component, page, recordToDisplay);
    },

    // this function call on click on the previous/Next page button
    navigate: function(component, event, helper) {
        //Check if the page is select or not, Default 1
        let page = component.get("v.currentPage") || 1;
        // get the button's label
        let direction = event.getSource().get("v.label");

        // get the select option (drop-down) values.
        let recordToDisplay = component.find("recordSize").get("v.value");

        // set the current page
        page = direction === "Previous Page" ? (page - 1) : (page + 1);

        // call the helper function
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

    // this function call on the select opetion change,
    onSelectChange: function(component, event, helper) {
        let page = 1
        // get the select option (drop-down) values.
        let recordToDisplay = component.find("recordSize").get("v.value");
        // call the helper function
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