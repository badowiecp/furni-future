({
    captureWarehouseId : function(component,event) {
        let pageRef = component.get("v.pageReference");
        let warehouseId = pageRef.state.c__warehouseId;
        let warehouseName = pageRef.state.c__warehouseName;
        component.set("v.warehouseId", warehouseId);
        component.set("v.warehouseName", warehouseName);
    },

    setTabName : function(component,event){
        let workspaceAPI = component.find("workspace");
        workspaceAPI.getFocusedTabInfo().then(function(response) {
            let focusedTabId = response.tabId;
            workspaceAPI.setTabLabel({
                tabId: focusedTabId,
                label: component.get("v.warehouseName")
            });
            workspaceAPI.setTabIcon({
                tabId: focusedTabId,
                icon: "utility:fulfillment_order",
                iconAlt: component.get("v.warehouseName")
            });
        })
    }
})