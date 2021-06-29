({
    handleCancel : function(component, event, helper) {
        component.find("overlayLib").notifyClose();
    },

     handleDelete : function(component, event, helper) {
        let action = component.get("c.deleteRating");

        action.setParams({
            "ratingId" : component.get("v.ratingId")
        });
        console.log('Delete params set');

        action.setCallback(this, function(response){
            let state = response.getState();
            if (state === "SUCCESS"){
                let resultsToast = $A.get("e.force:showToast");
                resultsToast.setParams({
                    "title": "Success",
                    "message": "Rating deleted",
                    "type": "success"
                });
                resultsToast.fire();
                $A.get("e.c:FF_RatingAdded").fire();
                component.find("overlayLib").notifyClose();
                console.log('Successfully deleted');
            }else{
                console.log("Failed delete with state: " + state);
            }
        });
        $A.enqueueAction(action);
    }
})