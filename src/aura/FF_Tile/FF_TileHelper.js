({

    getPhotoId : function(component,event){
        console.log('getPhotoId enter');
        let action = component.get("c.getContentVersionIdForMainProductImage");
        action.setParams({
            "productId" : component.get("v.product.Id")
        });
        console.log('ProductId set: ' + component.get("v.product.Id"));

        action.setCallback(this, function(response){
            let state = response.getState();
            if (state === "SUCCESS"){
                let photoId = response.getReturnValue();
                component.set("v.contentVersionId",photoId);
                console.log('PhotoId: ' + photoId);
            }else{
                let error = response.getError();
                console.log("Failed with state: " + state + ' Error: ' + error[0].message);
            }
        });
        $A.enqueueAction(action);
    }

})