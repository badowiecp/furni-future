import { LightningElement,api,wire,track } from 'lwc';
import { getObjectInfo } from 'lightning/uiObjectInfoApi';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import addCustomerToClub from '@salesforce/apex/FF_FurniClubController.addCustomerToClub';
import checkIfMember from '@salesforce/apex/FF_FurniClubController.checkIfMember';
import errorLabel from '@salesforce/label/c.FF_Error';
import warningLabel from '@salesforce/label/c.FF_Warning';
import chooseCategoryLabel from '@salesforce/label/c.FF_Please_choose_desired_furniture_category_first';
import provideBirthdayLabel from '@salesforce/label/c.FF_Please_provide_your_birthdate_first';
import birthdayInFutureLabel from '@salesforce/label/c.FF_Birthdate_cannot_be_in_the_future';
import acceptTermsWarningLabel from '@salesforce/label/c.FF_Please_read_and_accept_terms_and_conditions';
import furnitureCategoryLabel from '@salesforce/label/c.FF_Furniture_category';
import birthdateLabel from '@salesforce/label/c.FF_Birthdate';
import joinLabel from '@salesforce/label/c.FF_Join';
import acceptTermsLabel from '@salesforce/label/c.FF_Accept_terms_and_conditions';
import membershipConfirmationLabel from '@salesforce/label/c.FF_Furni_club_confirmation_email_sent';
import currentMemberMessageLabel from '@salesforce/label/c.FF_Furni_club_member_message';
import checkProductsLabel from '@salesforce/label/c.FF_Check_products';
import completeFormLabel from '@salesforce/label/c.FF_Complete_form';
export default class FfFurniClubForm extends LightningElement {
    @track showSpinner = false;
    isMember;
    formValid;
    @track joinSent = false;
    @api birthdate;
    @api termsAccepted;
    @track selectedSpaceType;
    @track spaceTypes;
    label = {
        furnitureCategoryLabel,
        birthdateLabel,
        acceptTermsLabel,
        joinLabel,
        membershipConfirmationLabel,
        currentMemberMessageLabel,
        checkProductsLabel,
        completeFormLabel
    };

    connectedCallback() {
        checkIfMember({})
        .then((result) => {
            this.isMember = result;
        })
        .catch((error) => {
            this.showNotification(errorLabel,error,"error");
        })
    }

    @wire(getObjectInfo, { objectApiName: 'Product2' })
    productMetadata({data,error}){
        if(data) {
            let optionsValues = [];
            const rtInfos = data.recordTypeInfos;
            let rtValues = Object.values(rtInfos);

            for(let i = 0; i < rtValues.length; i++) {
                if(rtValues[i].name !== 'Master') {
                    optionsValues.push({
                        label: rtValues[i].name,
                        value: rtValues[i].recordTypeId
                    })
                }
            }
            this.spaceTypes = optionsValues;
        }else if(error) {
            this.showNotification(warningLabel,JSON.stringify(error),"warning");
        }
    }

    handleJoin(){
        this.validateForm();
        if(this.formValid){
            this.toggleSpinner();
            addCustomerToClub({productTypeId: this.selectedSpaceType, birthdate: this.birthdate})
            .then((result) => {
                this.joinSent = true;
                this.toggleSpinner();
            })
            .catch((error) => {
                this.toggleSpinner();
                this.showNotification(errorLabel,error,"error");
            });
        }
    }

    validateForm(){
        if(this.selectedSpaceType==null){
            this.formValid = false;
            this.showNotification(warningLabel,chooseCategoryLabel,"warning");
        }else if(!this.birthdate){
            this.formValid = false;
            this.showNotification(warningLabel,provideBirthdayLabel,"warning");
        }else if(new Date(this.birthdate) > new Date()){
            this.formValid = false;
            this.showNotification(warningLabel,birthdayInFutureLabel,"warning");
        }else if(!this.termsAccepted){
            this.formValid = false;
            this.showNotification(warningLabel,acceptTermsWarningLabel,"warning");
        }else{
            this.formValid = true;
        }
    }

    handleChangeType(event){
        this.selectedSpaceType = event.target.value;
    }

    handleChangeBirthdate(event){
        this.birthdate = event.target.value;
    }

    handleChangeTerms(event){
        this.termsAccepted = event.target.checked;
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