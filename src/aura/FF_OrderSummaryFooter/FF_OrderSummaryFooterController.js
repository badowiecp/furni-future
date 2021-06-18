({

    handleNavigate: function(component, event, helper) {
        var actionClicked = event.getSource().getLocalId();

        var navigate = component.getEvent("navigateFlowEvent");
        navigate.setParam("action", actionClicked);
        navigate.fire();
    }

})