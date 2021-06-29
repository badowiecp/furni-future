({
    doInit : function(component,event,helper){
       helper.getProducts(component,event);
    },

    goLeft: function (component, event, helper) {
        helper.scrollLeft(component,event);
    },

    goRight: function (component, event, helper) {
        helper.scrollRight(component,event);
    },

    handleResize: function (component, event, helper) {
        helper.resize(component,event);
    }

})