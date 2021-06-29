import { LightningElement,wire } from 'lwc';
import { subscribe, unsubscribe, MessageContext } from 'lightning/messageService';
import WAREHOUSE_LIST_UPDATE_MESSAGE from '@salesforce/messageChannel/WarehouseListUpdate__c';
import warehousesMapLabel from '@salesforce/label/c.FF_Warehouses_map';
export default class FF_WarehouseMap extends LightningElement {
    mapMarkers = [];
    subscription = null;
    mapOptions = {
        'disableDefaultUI': true
    };
    label = {
        warehousesMapLabel
    };

    @wire(MessageContext)
    messageContext;

    connectedCallback() {
      this.subscription = subscribe(
          this.messageContext,
          WAREHOUSE_LIST_UPDATE_MESSAGE,
          (message) => {
              this.handleWarehouseListUpdate(message);
          });
    }

    disconnectedCallback() {
      unsubscribe(this.subscription);
      this.subscription = null;
    }

    handleWarehouseListUpdate(message) {
      this.mapMarkers = message.warehouses.map(warehouse => {
        const Latitude = warehouse.FF_Location__Latitude__s;
        const Longitude = warehouse.FF_Location__Longitude__s;
        return {
          location: { Latitude, Longitude },
          title: warehouse.Name,
          description: `Coords: ${Latitude}, ${Longitude}`,
        };
      });
    }

    getIsMarkersEmpty(){
        return this.mapMarkers.length > 0;
    }


}