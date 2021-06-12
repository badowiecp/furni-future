({

    handleClose : function(component, event, helper) {
        component.find("overlayLib").notifyClose();
    },

    handleConfirm : function(component, event, helper) {
        console.log('Enter navigate to basket');
        event.preventDefault();
        var navService = component.find("navService");
        var pageReference = {
            type: "comm__namedPage",
            attributes: {
                name: "Confirm_basket__c"
            }
        };
        navService.navigate(pageReference);
        console.log('Exit navigate to basket');
    }

})