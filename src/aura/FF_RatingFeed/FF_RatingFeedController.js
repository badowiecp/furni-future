({

    doInit : function(component,event,helper){
        helper.checkUserId(component,event);
        helper.getRatings(component,event);
        console.log('Init end');
    },

    handleDelete : function(component,event,helper){
        helper.deleteRating(component,event);
    },

    handleEdit : function(component,event,helper){
        helper.editRating(component,event);
    }

})