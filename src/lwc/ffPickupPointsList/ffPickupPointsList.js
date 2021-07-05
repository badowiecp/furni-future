import { LightningElement,api,track } from 'lwc';
import getAvailablePickupPoints from '@salesforce/apex/FF_WarehouseController.getAvailablePickupPoints';
export default class FfPickupPointsList extends LightningElement {
    @api productId;
    @track showSpinner = false;
    warehouseWrappers;

    connectedCallback() {
        this.toggleSpinner();
        getAvailablePickupPoints({productId: this.productId})
        .then((result) => {
            this.warehouseWrappers = result;
            this.toggleSpinner();
        })
        .catch((error) => {
            this.showNotification(errorLabel,error,"error");
            this.toggleSpinner();
        })
    }

    toggleSpinner() {
        this.showSpinner = !this.showSpinner;
    }

    showNotification(title, message, variant) {
        const event = new ShowToastEvent({
            title: title,
            message: message,
            variant: variant,
        });
        this.dispatchEvent(event);
    }
}