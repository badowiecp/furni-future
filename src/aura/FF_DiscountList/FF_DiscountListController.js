({

    init: function (component, event, helper) {
        helper.prepareRowActions(component,event);
        let page = component.get("v.currentPage");
        let recordToDisplay = component.find("recordSize").get("v.value");
        helper.getPriceBooks(component, event);
    },

    handleNew : function(component,event,helper){
        helper.redirectToNewDiscount(component,event);
    },

    handleRowAction: function (component, event, helper) {
        let action = event.getParam('action');
        let row = event.getParam('row');

        switch (action.name) {
            case 'view':
                helper.view(component, row);
                break;
            case 'edit':
                helper.edit(component, row);
                break;
            case 'activate':
                helper.showActivationModal(component, row);
                break;
            case 'deactivate':
                helper.showActivationModal(component, row);
                break;
        }
    },

    navigate: function(component, event, helper) {
        let page = component.get("v.currentPage") || 1;
        let direction = event.getSource().get("v.label");
        let recordToDisplay = component.find("recordSize").get("v.value");
        page = direction === $A.get("$Label.c.FF_Previous_Page") ? (page - 1) : (page + 1);
        helper.getPriceBooks(component, page, recordToDisplay);
    },

    navigateToFirst: function(component, event, helper) {
        let recordToDisplay = component.find("recordSize").get("v.value");
        helper.getPriceBooks(component, 1, recordToDisplay);
    },

    navigateToLast: function(component, event, helper) {
       let recordToDisplay = component.find("recordSize").get("v.value");
       helper.getPriceBooks(component, component.get("v.totalPages"), recordToDisplay);
    },

    onSelectChange: function(component, event, helper) {
        let page = 1
        let recordToDisplay = component.find("recordSize").get("v.value");
        helper.getPriceBooks(component, page, recordToDisplay);
    }

})