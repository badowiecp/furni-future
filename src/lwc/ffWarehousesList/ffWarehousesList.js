import { LightningElement,track } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { NavigationMixin } from 'lightning/navigation';
import getWarehouses from '@salesforce/apex/FF_WarehouseController.getWarehouses';
import errorLabel from '@salesforce/label/c.FF_Error';
import warehousesLabel from '@salesforce/label/c.FF_Warehouses';
import nameLabel from '@salesforce/label/c.FF_Name';
import storageCapacityLabel from '@salesforce/label/c.FF_Storage_capacity';
import storageCapacityUsedLabel from '@salesforce/label/c.FF_Storage_capacity_used';
import cityLabel from '@salesforce/label/c.FF_City';
import countryLabel from '@salesforce/label/c.FF_Country';
import manageLabel from '@salesforce/label/c.FF_Manage';
const columns = [
    { label: nameLabel, fieldName: 'Name', type: 'text' },
    { label: storageCapacityLabel, fieldName: 'FF_Storage_capacity__c', type: 'number' },
    { label: storageCapacityUsedLabel, fieldName: 'FF_Storage_capacity_used__c', type: 'number' },
    { label: cityLabel, fieldName: 'FF_City__c', type: 'text' },
    { label: countryLabel, fieldName: 'FF_Country__c', type: 'text' },
    { type: 'action', typeAttributes: { rowActions: [{ label: manageLabel, name: 'manage' }] } }
];
export default class FfWarehousesList extends NavigationMixin(LightningElement) {
    columns = columns;
    @track warehouses;
    error;
    label = {
        errorLabel,
        warehousesLabel
    };

    connectedCallback() {
        getWarehouses({city: null, capacity: null})
        .then((result) => {
            this.warehouses = result;
            this.error = undefined;
        })
        .catch((error) => {
            this.error = error;
            this.warehouses = undefined;
            this.showNotification(errorLabel,error,"error");
        })
    }

    handleRowAction(event) {
        const actionName = event.detail.action.name;
        const row = event.detail.row;
        switch (actionName) {
            case 'manage':
                this.manage(row);
                break;
        }
    }

    manage(row){
        this[NavigationMixin.Navigate]({
            type: "standard__component",
            attributes: {
                componentName: "c__FF_WarehouseManageNav"
            },
            state: {
                c__warehouseId: row.Id,
                c__warehouseName: row.Name
            }
        });
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