({

    init: function (component, event, helper) {
        var rowActions = helper.getRowActions.bind(this, component);

        component.set('v.columns', [
            {label: "Discounts", fieldName: 'Name', type: 'text'},
            {label: "Description", fieldName: 'Description', type: 'text'},
            {label: "Active", fieldName: 'IsActive', type: 'boolean'},
            {type: "action", typeAttributes: { rowActions: rowActions }}
        ]);

        helper.getPriceBooks(component, event);
    },

    handleRowAction: function (component, event, helper) {
        var action = event.getParam('action');
        var row = event.getParam('row');

        switch (action.name) {
            case 'edit':
                helper.edit(component, row);
                break;
            case 'activate':
                helper.activate(component, row);
                break;
            case 'deactivate':
                helper.deactivate(component, row);
                break;
        }
    }

})