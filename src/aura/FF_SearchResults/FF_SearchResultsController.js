({

    doInit : function(component, event, helper) {
        component.set("v.query",'');
        helper.getProducts(component, '', '', '', 1, component.find("recordsPerPage").get("v.value"));
    },

    doSearch : function(component, event, helper) {
        let param = event.getParam("arguments");
        component.set("v.query", param.query);
        component.set("v.recordType", param.recordType);
        component.set("v.productFamily", param.productFamily);
        component.set("v.pageNumber", 1);
        let recordsPerPage = component.find("recordsPerPage").get("v.value");
        helper.getProducts(component, param.query, param.recordType, param.productFamily, component.get("v.pageNumber"),recordsPerPage);

    },

    navigate: function(component, event, helper) {
        let page = component.get("v.pageNumber");
        let direction = event.getSource().get("v.label");

        page = direction === "Previous" ? (page - 1) : (page + 1);
        let recordsPerPage = component.find("recordsPerPage").get("v.value");
        helper.getProducts(component, component.get("v.query"), component.get("v.recordType"), component.get("v.productFamily"), page, recordsPerPage);
    },

    navigateToFirst: function(component, event, helper) {
        let recordToDisplay = component.find("recordsPerPage").get("v.value");
        helper.getProducts(component, component.get("v.query"), component.get("v.recordType"), component.get("v.productFamily"), 1, recordToDisplay);
    },

    navigateToLast: function(component, event, helper) {
       let recordToDisplay = component.find("recordsPerPage").get("v.value");
       helper.getProducts(component, component.get("v.query"), component.get("v.recordType"), component.get("v.productFamily"), component.get("v.totalPages"), recordToDisplay);
    },

    onSelectChange: function(component, event, helper) {
        let page = 1;
        let query = component.get("v.query");
        let recordsPerPage = component.find("recordsPerPage").get("v.value");
        helper.getProducts(component, component.get("v.query"), component.get("v.recordType"), component.get("v.productFamily"), page, recordsPerPage);
    },

    handleShowMore : function(component,event,helper){
        let page = 1;
        let query = component.get("v.query");
        let recordsPerPage = component.find("recordsPerPage").get("v.value");
        if(recordsPerPage < 29){
            recordsPerPage += 7;
        }
        helper.getProducts(component, component.get("v.query"), component.get("v.recordType"), component.get("v.productFamily"), page, recordsPerPage);
    }

})