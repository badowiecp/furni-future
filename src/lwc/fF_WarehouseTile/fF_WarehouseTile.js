import { LightningElement,api,wire } from 'lwc';
import { publish, MessageContext } from 'lightning/messageService';
import WAREHOUSE_LIST_UPDATE_MESSAGE from '@salesforce/messageChannel/WarehouseListUpdate__c';
import storageCapacityLabel from '@salesforce/label/c.FF_Storage_capacity';
export default class FF_WarehouseTile extends LightningElement {
    @api warehouse;
    label ={
        storageCapacityLabel
    }

    @wire(MessageContext)
    messageContext;
    
    handleLocationClick(){
        const message = {
            warehouses: [this.warehouse]
        };
        publish(this.messageContext, WAREHOUSE_LIST_UPDATE_MESSAGE, message);
    }
    
}