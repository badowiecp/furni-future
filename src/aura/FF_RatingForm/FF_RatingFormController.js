({

    doInit : function(component, event, helper){
        helper.onInit(component, event, helper);
    },

    onSave : function(component, event, helper){
        component.find("service").saveRecord(function(saveResult) {
            console.log('Save result: ' + saveResult.state);
            if (saveResult.state === "SUCCESS" || saveResult.state === "DRAFT") {
                // record is saved successfully
                var resultsToast = $A.get("e.force:showToast");
                if(resultsToast!=undefined){
                    resultsToast.setParams({
                        "title": "Success",
                        "message": "Rating saved"
                    });
                    resultsToast.fire();
                    console.log(component.get("v.ratingFields.Id"));
                    component.getEvent("ratingAdded").fire();
                    helper.onInit(component, event, helper);
                }else{
                    alert('Rating saved');
                }

            } else if (saveResult.state === "INCOMPLETE") {
                alert("User is offline, device doesn't support drafts.");
            } else if (saveResult.state === "ERROR") {
                console.log('Enter error');

                if(saveResult.error[0].pageErrors[0]==null && saveResult.error[0].message.includes("data value too large")){
                    var resultsToast = $A.get("e.force:showToast");
                    if(resultsToast!=undefined){
                        resultsToast.setParams({
                            "title": "Error",
                            "message": "Comment must have up to 1000 characters"
                        });
                        resultsToast.fire();
                        console.log('Toast fired');
                    }
                }else{
                    var resultsToast = $A.get("e.force:showToast");
                    if(resultsToast!=undefined){
                        resultsToast.setParams({
                            "title": "Error",
                            "message": JSON.stringify(saveResult.error[0].pageErrors[0].message)
                        });
                        resultsToast.fire();
                    }
                }
                console.log('Problem saving rating, error: ' + JSON.stringify(saveResult.error[0].pageErrors[0].message));
            } else {
                alert('Unknown problem, state: ' + saveResult.state + ', error: ' + JSON.stringify(saveResult.error));
            }
        });
    }

})