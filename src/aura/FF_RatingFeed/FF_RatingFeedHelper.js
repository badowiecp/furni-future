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
                component.set("v.ratings",response.getReturnValue());
                thisHelper.calculateAverageRating(component,event);
            }else{
                console.log("Failed with state: " + state);
            }
        });
        $A.enqueueAction(action);
    },

    calculateAverageRating : function(component,event){
        let ratings = component.get("v.ratings");
        console.log('Ratings length: ' + ratings.length);
        let averageRating = 0;
        if(ratings.length > 0){
            let ratingSum = 0;
            let ratingCount = 0;
            for(let i = 0; i < ratings.length; i++){
                if(ratings[i].FF_Score__c!=null && ratings[i].FF_Score__c>0){
                    ratingSum += ratings[i].FF_Score__c;
                    ratingCount += 1;
                }
            }
            if(ratingCount > 0){
                averageRating = ratingSum/ratingCount;
            }
        }
        component.set("v.averageRating",averageRating);
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
    },

    editRating : function(component,event){

    }


})