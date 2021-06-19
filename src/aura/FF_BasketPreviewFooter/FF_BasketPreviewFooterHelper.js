({

    redirectToConfirmOrder : function(component,event){
        event.preventDefault();
        var navService = component.find("navService");
        var pageReference = {
            type: "comm__namedPage",
            attributes: {
                name: "Confirm_basket__c"
            }
        };
        navService.navigate(pageReference);
    }


})