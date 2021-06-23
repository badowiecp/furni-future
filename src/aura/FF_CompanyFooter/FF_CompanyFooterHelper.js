({

    getFooter : function(component,event){
        let action = component.get("c.getFooterInformation");

        action.setCallback(this, function(response){
            let state = response.getState();
            if (state === "SUCCESS"){
                component.set("v.footerContent",response.getReturnValue());
                console.log(JSON.parse(JSON.stringify(response.getReturnValue())));
                console.log('Street: ' + component.get("v.footerContent.Street"));
            }else{
                let error = response.getError();
                let resultsToast = $A.get("e.force:showToast");
                resultsToast.setParams({
                    "title": $A.get("$Label.FF_Error"),
                    "message": error[0].message,
                    "type": "error"
                });
                resultsToast.fire();
            }
        });
        $A.enqueueAction(action);
    }

})