({

    onInit : function(component,event,helper){
        helper.getBasket(component,event);
    },

    handleNavigate : function(component,event,helper){
        helper.next(component,event);
    },

    handleChange : function(component,event,helper){
        helper.validateInput(component,event);
        helper.calculateTotalPrice(component,event);
    },

    handleDelete : function(component,event,helper){
        helper.delete(component,event);
    }

})