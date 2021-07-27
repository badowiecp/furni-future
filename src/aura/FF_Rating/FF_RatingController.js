({

    onRatingAdded : function (component, event, helper) {
        let ratingFeedComponent = component.find("ratingFeed");
        if(ratingFeedComponent){
            ratingFeedComponent.refresh();
        }
    }

})