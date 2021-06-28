({
    doInit : function(component){
       let action = component.get("c.getFileLinks");

       action.setParams({
           "productId": component.get("v.recordId")
       });

       action.setCallback(this, function(response) {
           let state = response.getState();
           if(component.isValid() && state === 'SUCCESS') {
               component.set("v.images", response.getReturnValue());
           }
       });
        $A.enqueueAction(action);
    },

    goLeft: function (component, event, helper) {
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

    goRight: function (component, event, helper) {
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

    handleResize: function (component, event, helper) {
        let max = component.find("wrapper").getElement().scrollWidth;
        let shown = component.find("inner").getElement().offsetWidth;
        if ((max - shown) === 0) {
            component.set("v.maxPosition", 1);
        } else {
            component.set("v.maxPosition", shown - max);
        }
    },

    openImage: function (component, event, controller) {
        let index = event.currentTarget.dataset.index;
        let images = component.get("v.images");
        component.set("v.selectedImage", images[index]);
        component.set("v.isOpen", true);
    },

    closeModel : function(component, event, helper) {
       component.set("v.isOpen", false);
    }
})