({

    getBasket : function(component,event){
        let action = component.get("c.checkAndReturnBasket");
        var self = this;
        action.setCallback(this, function(response) {
            let state = response.getState();
            if (state === "SUCCESS"){
                component.set("v.basket",response.getReturnValue());
                component.set("v.opportunityId",response.getReturnValue().opportunityId);
//                self.addBasketProductsToOpportunity(component,event);
                console.log('Basket fetched');
            }else{
                let error = response.getError();
                console.log("Failed with state: " + state + ' Error: ' + error[0].message + error[0].stackTrace);
            }
        });
        $A.enqueueAction(action);
    },

//    addBasketProductsToOpportunity : function(component,event){
//        let action = component.get("c.saveOpportunityLineItems");
//        console.log('Basket: ' + JSON.stringify(component.get("v.basket")));
//        console.log("Opportunity Id for productLine creation: " + component.get("v.opportunityId"));
//        action.setParams({
//            "basketJSon": JSON.stringify(component.get("v.basket"))
//        });
//        action.setCallback(this, function(response) {
//            let state = response.getState();
//            if (state === "SUCCESS"){
//                component.set("v.opportunityId",response.getReturnValue());
//                component.set("v.basket.opportunityId",response.getReturnValue())
//                console.log('Opportunity line items added: ' + component.get("v.basket.opportunityId"));
//            }else{
//                let error = response.getError();
//                console.log("Failed with state: " + state + ' Error: ' + error[0].message + error[0].stackTrace);
//            }
//        });
//        $A.enqueueAction(action);
//    },

//    addProductToDelete : function(component,event){
//        console.log('Enter add to delete');
//        let lineItemsToDeleteIds = component.get("v.lineItemsToDeleteIds");
//        lineItemsToDeleteIds.push(event.getSource().get("v.value"));
//        component.set("v.lineItemsToDeleteIds",lineItemsToDeleteIds);
//        var resultsToast = $A.get("e.force:showToast");
//        resultsToast.setParams({
//            "title": "Success",
//            "message": "Product added to delete",
//            "type": "success"
//        });
//        resultsToast.fire();
//    },

//    deleteProducts : function(component,event){
//        let action = component.get("c.deleteLineItems");
//
//        action.setParams({
//            "lineItemsIds": component.get("v.lineItemsToDeleteIds"),
//            "opportunityId": component.get("v.basket.opportunityId")
//        });
//
//        action.setCallback(this, function(response) {
//            let state = response.getState();
//            if (state === "SUCCESS"){
//                console.log('Line items deleted');
//            }else{
//                let error = response.getError();
//                console.log("Failed with state: " + state + ' Error: ' + error[0].message + error[0].stackTrace);
//            }
//        });
//        $A.enqueueAction(action);
//    },

    change : function(component,event){
        let action = component.get("c.recalculateLineItems");
        console.log('Enter change ' + event.getSource().get("v.value"));
        console.log('Enter change ' + component.get("v.basket.opportunityId"));
        try{
            console.log(event.getSource().get("v.name"));
        }catch(error){
            console.log(error);
        }
        action.setParams({
            "productId": event.getSource().get("v.value"),
            "opportunityId": component.get("v.opportunityId"),
            "quantity": event.getSource().get("v.name")
        });
        console.log('Change params set');
        action.setCallback(this, function(response) {
            let state = response.getState();
            if (state === "SUCCESS"){
                if(response.getReturnValue().totalQuantity!=null && response.getReturnValue().totalQuantity>0){
                    component.set("v.basket",response.getReturnValue());
                    var resultsToast = $A.get("e.force:showToast");
                    resultsToast.setParams({
                        "title": "Success",
                        "message": "Basket updated",
                        "type": "success"
                    });
                    resultsToast.fire();
                    console.log('Basket refreshed');
                }else{
                    event.preventDefault();
                    var navService = component.find("navService");
                    var pageReference = {
                        type: "comm__namedPage",
                        attributes: {
                            name: "Explore_products__c"
                        }
                    };
                    navService.navigate(pageReference);
                }

//                this.updateBasket(component,event);
//                console.log('Line items recalculated');
            }else{
                let error = response.getError();
                console.log("Failed with state: " + state + ' Error: ' + error[0].message + error[0].stackTrace);
            }
        });
        $A.enqueueAction(action);
    },

    updateBasket : function(component,event){
        let action = component.get("c.getBasketFromOpportunity");

        action.setParams({
            "opportunityId": component.get("v.basket.opportunityId")
        });

        action.setCallback(this, function(response) {
            let state = response.getState();
            if (state === "SUCCESS"){
                if(response.getReturnValue().totalQuantity!=null){
                    component.set("v.basket",response.getReturnValue());
                    var resultsToast = $A.get("e.force:showToast");
                    resultsToast.setParams({
                        "title": "Success",
                        "message": "Basket updated",
                        "type": "success"
                    });
                    resultsToast.fire();
                    console.log('Basket refreshed');
                }else{
                    event.preventDefault();
                    var navService = component.find("navService");
                    var pageReference = {
                        type: "comm__namedPage",
                        attributes: {
                            name: "Explore_products__c"
                        }
                    };
                    navService.navigate(pageReference);
                }
            }else{
                let error = response.getError();
                console.log("Failed with state: " + state + ' Error: ' + error[0].message + error[0].stackTrace);
            }
        });
        $A.enqueueAction(action);
    },

    next : function(component,event){
        var navigate = component.get("v.navigateFlow");
        navigate(event.getParam("action"));
    }

})