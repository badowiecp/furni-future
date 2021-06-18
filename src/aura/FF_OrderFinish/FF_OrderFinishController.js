({

    onInit : function(component,event,helper){
        helper.checkIfShowButton(component,event);
    },

    goToPayment : function(component,event,helper){
        var eUrl= $A.get("e.force:navigateToURL");
        eUrl.setParams({
          "url": 'https://www.ipko.pl/'
        });
        eUrl.fire();
    }

})