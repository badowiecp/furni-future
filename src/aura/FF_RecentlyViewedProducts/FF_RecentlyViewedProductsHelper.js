({

    getProducts : function(component,event){
        let action = component.get("c.getRecentProducts");
        action.setCallback(this, function(response) {
            let state = response.getState();
            if(component.isValid() && state === 'SUCCESS') {
                component.set("v.products", response.getReturnValue());
            }else{
                let errors = response.getError();
                let toastEvent = $A.get("e.force:showToast");
                toastEvent.setParams({
                    title: $A.get("$Label.c.FF_Error"),
                    message: errors[0].message,
                    type: "error"
                });
                toastEvent.fire();
            }
        });
        $A.enqueueAction(action);
    },

    scrollLeft : function(component,event){
        let position = component.get("v.position");
        let y = 0;
        if (position > 94) {
            y = 95;
        } else {
            y = position;
        }
        let x = 1;
        let timeoutHandler = function (i) {
            if (i < y) {
                component.set("v.position", position - i);
                i += 3;
                setTimeout(() => {
                        timeoutHandler(i);
                    }
                    , 15);
            }
        };
        setTimeout(() => {
                timeoutHandler(x);
            }, 15
        );
    },

    scrollRight : function(component,event){
        let position = component.get("v.position");
        let y = 0;
        if (position + 95 < component.get("v.maxPosition")) {
            y = 95;
        } else {
            y = component.get("v.maxPosition") - position;
        }
        let x = 1;
        let timeoutHandler = function (i) {
            if (i < y) {
                component.set("v.position", position + i);
                i += 3;
                setTimeout(() => {
                        timeoutHandler(i);
                    }
                    , 15);
            }
        };
        setTimeout(() => {
                timeoutHandler(x);
            }, 15
        );
    },

    resize : function(component,event){
        let max = component.find("wrapper").getElement().scrollWidth;
        let shown = component.find("inner").getElement().offsetWidth;
        if ((max - shown) === 0) {
            component.set("v.maxPosition", 1);
        } else {
            component.set("v.maxPosition", shown - max);
        }
    }

})