({

    getRatings : function(component,event){
        let thisHelper = this;
        let action = component.get("c.fetchRatings");
        action.setParams({
            "productId" : component.get("v.productId")
        });

        action.setCallback(this, function(response){
            let state = response.getState();
            if (state === "SUCCESS"){
                component.set("v.ratingsWrapper",response.getReturnValue());
            }else{
                console.log("Failed with state: " + state);
            }
        });
        $A.enqueueAction(action);
    },

    checkUserId : function(component,event){
        let action = component.get("c.getUserId");

        action.setCallback(this, function(response){
            let state = response.getState();
            if (state === "SUCCESS"){
                component.set("v.userId",response.getReturnValue());
            }else{
                console.log("Failed getting user id with state: " + state);
            }
        });
        $A.enqueueAction(action);
    },

    deleteRating : function(component,event){
        var modalBody;
        var modalFooter;
        $A.createComponents([
            ["c:FF_RatingDeleteMessage",{}],
            ["c:FF_RatingDeleteFooter", { ratingId : event.getSource().get('v.value')}]
        ],
        function(components, status){
            if (status === "SUCCESS") {
                modalBody = components[0];
                modalFooter = components[1];
                component.find('overlayLib').showCustomModal({
                   header: "Delete rating",
                   body: modalBody,
                   footer: modalFooter,
                   showCloseButton: true,
                   cssClass: "slds-modal_small",
                   closeCallback: function() {
                   }
               })
            }
        }
       );
    }
})