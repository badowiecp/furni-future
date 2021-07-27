import { LightningElement,wire } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import getMembers from '@salesforce/apex/FF_FurniClubController.getMembers';
import errorLabel from '@salesforce/label/c.FF_Error';
import usersLabel from '@salesforce/label/c.FF_Users';
import nameLabel from '@salesforce/label/c.FF_Name';
import emailLabel from '@salesforce/label/c.FF_Email';
import dateOfJoiningLabel from '@salesforce/label/c.FF_Date_of_joining';
import tierLabel from '@salesforce/label/c.FF_Tier';
import discountLabel from '@salesforce/label/c.FF_Discount';
import ordersCountLabel from '@salesforce/label/c.FF_Orders_count';
import ordersAmountLabel from '@salesforce/label/c.FF_Orders_amount';
const columns = [
    { label: nameLabel, fieldName: 'nameLink', type: 'url', typeAttributes: {label: { fieldName: 'name' }, target: '_blank'}},
    { label: emailLabel, fieldName: 'email', type: 'email' },
    { label: dateOfJoiningLabel, fieldName: 'dateJoined', type: 'date' },
    { label: tierLabel, fieldName: 'tier', initialWidth: 150, type: 'text' },
    { label: discountLabel, fieldName: 'discountPercent', initialWidth: 150, type: 'number' },
    { label: ordersCountLabel, fieldName: 'ordersCount', initialWidth: 200, type: 'number' },
    { label: ordersAmountLabel, fieldName: 'ordersAmount', type: 'currency' }
];
export default class FfFurniClubMembersList extends LightningElement {
    columns = columns;
    members;
    error;
    label = {
        usersLabel
    };

    connectedCallback() {
        getMembers({})
        .then((result) => {
            this.members = result;
            this.error = undefined;
        })
        .catch((error) => {
            this.error = error;
            this.members = undefined;
            this.showNotification(errorLabel,error,"error");
        })
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