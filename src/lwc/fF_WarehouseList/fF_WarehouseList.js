import { LightningElement, wire } from 'lwc';
import { publish, MessageContext } from 'lightning/messageService';
import WAREHOUSE_LIST_UPDATE_MESSAGE from '@salesforce/messageChannel/WarehouseListUpdate__c';
import getWarehouses from '@salesforce/apex/FF_WarehouseController.getWarehouses';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import clearLabel from '@salesforce/label/c.FF_Clear';
import searchLabel from '@salesforce/label/c.FF_Search';
import noWarehousesLabel from '@salesforce/label/c.FF_No_warehouses_found';
import warehousesLabel from '@salesforce/label/c.FF_Warehouses';
import searchResultsLabel from '@salesforce/label/c.FF_Search_results';
import cityLabel from '@salesforce/label/c.FF_City';
import storageCapacityLabel from '@salesforce/label/c.FF_Storage_capacity';
import errorLabel from '@salesforce/label/c.FF_Error';
export default class FF_WarehouseList extends LightningElement {
    warehouses;
    error;
    city = '';
    storageCapacity;
    label = {
        clearLabel,
        searchLabel,
        noWarehousesLabel,
        warehousesLabel,
        searchResultsLabel,
        cityLabel,
        storageCapacityLabel
    };

    @wire(MessageContext)
    messageContext;

    connectedCallback() {
        this.search();
    }

    search(){
        getWarehouses({city: this.city, capacity: this.storageCapacity})
        .then((result) => {
            this.warehouses = result;
            this.error = undefined;
            if(this.hasResults){
                const message = {
                    warehouses: result
                };
                publish(this.messageContext, WAREHOUSE_LIST_UPDATE_MESSAGE, message);
            }
        })
        .catch((error) => {
            this.error = error;
            this.warehouses = undefined;
            this.showNotification(errorLabel,error,"error");
        })
    }

    clear(){
        this.city = '';
        this.storageCapacity = null;
        this.search();
    }

    get hasResults() {
		return (this.warehouses.length > 0);
	}

    handleCityInputChange(event){
        this.city = event.target.value;
    }

    handleStorageInputChange(event){
        this.storageCapacity = event.target.value;
    }

    showNotification(title, message, variant) {
        const evt = new ShowToastEvent({
            title: title,
            message: message,
            variant: variant,
        });
        this.dispatchEvent(evt);
    }
}