({

    onInit : function(component, event, helper){
        component.find("service").getNewRecord(
            "FF_Product_Rating__c",
            null,
            false,
            $A.getCallback(function() {
                var newRating = component.get("v.ratingRecord");
                var error = component.get("v.ratingError");
                if(error || (newRating === null)) {
                    console.log("Error initializing record template: " + error);
                }else {
                    component.set("v.ratingFields.FF_Product__c",component.get("v.productId"));
                    console.log("Record template initialized: " + newRating.apiName);
                }
            })
        );
    }

})