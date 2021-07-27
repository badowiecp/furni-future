import { LightningElement,api,track } from 'lwc';
import quantityLabel from '@salesforce/label/c.FF_Quantity';
export default class FfWarehouseProductWrapperElement extends LightningElement {
    @api wrapper;
    @track inputClass = 'quantityInput';
    edited;
    label = {
        quantityLabel
    }

    handleQuantityChange(event){
        this.wrapper = Object.assign({},JSON.parse(JSON.stringify(this.wrapper)));
        this.wrapper.quantity = event.target.value;
        this.wrapper.totalSize = parseInt(event.target.value) * this.wrapper.product.FF_Storage_size__c;
        this.edited = true;
        this.inputClass = this.edited = true ? 'quantityInput edited' : 'quantityInput';
        this.dispatchEvent(new CustomEvent('quantitychange'));
    }
    
}