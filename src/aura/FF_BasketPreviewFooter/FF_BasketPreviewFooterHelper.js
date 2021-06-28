({

    redirectToConfirmOrder : function(component,event){
        event.preventDefault();
        let navService = component.find("navService");
        let pageReference = {
            type: "comm__namedPage",
            attributes: {
                name: "Confirm_basket__c"
            }
        };
        navService.navigate(pageReference);
    }


})