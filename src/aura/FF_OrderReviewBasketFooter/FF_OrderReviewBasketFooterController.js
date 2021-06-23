({

    handleNext: function(component, event, helper) {
        let actionClicked = event.getSource().getLocalId();
        let navigate = component.getEvent("navigateFlowEvent");
        navigate.setParam("action", actionClicked);
        navigate.fire();
    }

})