({

    afterScriptsLoaded : function(component, event, helper) {
        var domEl = component.find("ratingarea").getElement();
        var currentRating = component.get("v.value");
        console.log('Rating: ' + currentRating);
        var readOnly = component.get("v.readonly");
        var maxRating = 10;

        var callback = function(rating) {
        component.set('v.value',rating);
        }

        component.ratingObj = rating(domEl,currentRating,maxRating,callback,readOnly);
    },

    onValueChange: function(component,event,helper) {
         if (component.ratingObj) {
            var value = component.get('v.value');
            component.ratingObj.setRating(value,false);
        }
    }

})