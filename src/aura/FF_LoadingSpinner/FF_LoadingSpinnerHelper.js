({
    showHideSpinner : function(component) {
        let showValue = component.get('v.show');
        if(showValue) {
            let spinner = component.find("spinner");
        	$A.util.removeClass(spinner, "slds-hide");
        } else {
            let spinner = component.find("spinner");
        	$A.util.addClass(spinner, "slds-hide");
        }
    }

})