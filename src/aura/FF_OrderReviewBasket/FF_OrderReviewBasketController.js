({

    onInit : function(component,event,helper){
        helper.getBasket(component,event);
    },

    handleDelete : function(component,event,helper){
        helper.addProductToDelete(component,event);
    },

    handleNavigate : function(component,event,helper){
        helper.next(component,event);
    },

    handleChange : function(component,event,helper){
        helper.change(component,event);
    }

})