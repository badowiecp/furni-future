({

    getPhotoId : function(component,event){
        let action = component.get("c.getContentVersionIdForMainProductImage");
        action.setParams({
            "productId" : component.get("v.product.Id")
        });

        action.setCallback(this, function(response){
            let state = response.getState();
            if (state === "SUCCESS"){
                let photoId = response.getReturnValue();
                component.set("v.contentVersionId",photoId);
            }
        });
        $A.enqueueAction(action);
    },

    getProductPrice : function(component,event){
        let action = component.get("c.getPriceBookEntry");
        action.setParams({
            "productId" : component.get("v.product.Id")
        });

        action.setCallback(this, function(response){
            let state = response.getState();
            if (state === "SUCCESS"){
                let price = response.getReturnValue();
                component.set("v.price",price);
            }
        });
        $A.enqueueAction(action);
    }

})