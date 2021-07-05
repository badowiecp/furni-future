import { LightningElement,api,track, wire } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { NavigationMixin } from 'lightning/navigation';
import getProducts from '@salesforce/apex/FF_WarehouseController.getProducts';
import getWarehouseById from '@salesforce/apex/FF_WarehouseController.getWarehouseById';
import saveWarehouseProducts from '@salesforce/apex/FF_WarehouseController.saveWarehouseProducts';
import errorLabel from '@salesforce/label/c.FF_Error';
import successLabel from '@salesforce/label/c.FF_Success';
import cancelLabel from '@salesforce/label/c.FF_Cancel';
import warningLabel from '@salesforce/label/c.FF_Warning';
import saveLabel from '@salesforce/label/c.FF_Save';
import storageCapacityLabel from '@salesforce/label/c.FF_Storage_capacity';
import storageCapacityUsedLabel from '@salesforce/label/c.FF_Storage_capacity_used';
import capacityLeftLabel from '@salesforce/label/c.FF_Capacity_left';
import productLabel from '@salesforce/label/c.FF_Product';
import typeLabel from '@salesforce/label/c.FF_Type';
import storageSizeLabel from '@salesforce/label/c.FF_Storage_size';
import totalSizeLabel from '@salesforce/label/c.FF_Total_size';
import quantityLabel from '@salesforce/label/c.FF_Quantity';
import storageCapacityExceededLabel from '@salesforce/label/c.FF_Warehouse_storage_capacity_exceeded';
import cannotSaveWarehouseLabel from '@salesforce/label/c.FF_Cannot_save_warehouse_storage';
import correctInputsLabel from '@salesforce/label/c.FF_Please_correct_inputs';
export default class FfEditStorage extends NavigationMixin(LightningElement) {
    @api warehouse;
    @api warehouseId;
    @track productWrappers;
    warehouseCapacityUsed;
    capacityLeft;
    @track showSpinner = false;
    inputsValid = false;
    label = {
        errorLabel,
        successLabel,
        cancelLabel,
        warningLabel,
        storageCapacityLabel,
        storageCapacityUsedLabel,
        capacityLeftLabel,
        saveLabel,
        productLabel,
        typeLabel,
        storageSizeLabel,
        totalSizeLabel,
        quantityLabel
    };
    
    connectedCallback() {
        this.toggleSpinner();
        getWarehouseById({warehouseId: this.warehouseId})
        .then((result) => {
            this.warehouse = Object.assign({},JSON.parse(JSON.stringify(result)));
            this.warehouseCapacityUsed = this.warehouse.FF_Storage_capacity_used__c;
            this.capacityLeft = this.warehouse.FF_Storage_capacity__c - this.warehouseCapacityUsed;
        })
        .catch((error) => {
            this.showNotification(errorLabel,error,"error");
        })
        
        getProducts({warehouseId: this.warehouseId})
        .then((result) => {
            this.productWrappers = result;
        })
        .catch((error) => {
            this.showNotification(errorLabel,error,"error");
        })
        this.toggleSpinner();
    }

    updateStorage(){
        let sum = this.calculateTotalSize();
        if(this.warehouse.FF_Storage_capacity__c >= sum){
            this.warehouseCapacityUsed = sum;
            this.capacityLeft = this.warehouse.FF_Storage_capacity__c - this.warehouseCapacityUsed;
        }else{
            this.showNotification(warningLabel,storageCapacityExceededLabel,"warning");
        }
    }
    
    handleSave(){
        this.validateInputs();
        if(this.inputsValid){
            this.toggleSpinner();
            this.save();
        }
    }

    handleRevert(){
        this.productWrappers = null;
        getProducts({warehouseId: this.warehouseId})
        .then((result) => {
            this.productWrappers = result;
        })
        .catch((error) => {
            this.showNotification(errorLabel,error,"error");
        });
    }

    save(){
        let products = this.gatherWrappers();
        saveWarehouseProducts({wrappers: products, warehouseId: this.warehouseId})
        .then(() => {
            this.toggleSpinner();
            this.showNotification(successLabel,"Saved","success");
            this[NavigationMixin.Navigate]({
                type: 'standard__navItemPage',
                attributes: {
                    apiName: 'Storage_manager'
                    // isUpdated: true
                }
            });
        })
        .catch((error) => {
            this.toggleSpinner();
            this.showNotification(errorLabel,error,"error");
        })
    }

    validateInputs(){
        let self = this;
        let wrappers = this.gatherWrappers();
        let invalidProducts =[];
        if(self.warehouse.FF_Storage_capacity__c < self.calculateTotalSize()){
            self.showNotification(errorLabel,cannotSaveWarehouseLabel,"error");
        }else{
            wrappers.forEach(function(wrapper){
                console.log(wrapper.quantity);
                if(wrapper.quantity){
                    if(wrapper.quantity % 1 !== 0){
                        invalidProducts.push(wrapper);
                    }else if(parseInt(wrapper.quantity) < 0){
                        invalidProducts.push(wrapper);
                    }
                }
            });
            if(invalidProducts.length==0){
                self.inputsValid = true;
            }else{
                self.showNotification(warningLabel,correctInputsLabel,"warning");
            }
        }
    }

    handleCancel(){
        this[NavigationMixin.Navigate]({
            type: 'standard__navItemPage',
            attributes: {
                apiName: 'Storage_manager'
            }
        });
    }

    gatherWrappers(){
        let products = [];
        let inputs = this.template.querySelectorAll(".wrapperElement");
        inputs.forEach(function(element){
            products.push(element.wrapper);
        });
        return products;
    }

    calculateTotalSize(){
        let sum = 0;
        let inputs = this.template.querySelectorAll(".wrapperElement");
        inputs.forEach(function(element){
            if(element.wrapper.totalSize){
                sum += parseInt(element.wrapper.totalSize);
            }
        });
        return sum;
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