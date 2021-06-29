({
    afterRender: function (component, helper) {
        this.superAfterRender();
        let position = component.get("v.position");
        let scroller = component.find("scroll_wrapper");
        let max = 0;
        scroller.scrollTo("custom", position, 0);
    },

    rerender: function (component, helper) {
        this.superRerender();
        let position = component.get("v.position");
        let totalPosition = component.get("v.maxPosition");
        let scroller = component.find("scroll_wrapper");
        scroller.scrollTo("custom", position, 0);
    }
})