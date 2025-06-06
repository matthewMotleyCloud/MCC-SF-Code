import { LightningElement, api, wire, track } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
import getCurrentYearPlan from '@salesforce/apex/AccountPlanController.getCurrentYearPlan';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { encodeDefaultFieldValues } from 'lightning/pageReferenceUtils'; 

export default class CurrentAccountPlan extends NavigationMixin(LightningElement) {
    @api recordId; // Account Id
    @track plan;
    @track error;
    @track fiscalYear;

    connectedCallback() {
        // Get current year using JS Date (adjust if your org's fiscal year is different)
        const today = new Date();
        this.fiscalYear = today.getFullYear().toString();
    }

    @wire(getCurrentYearPlan, { accountId: '$recordId', fiscalYear: '$fiscalYear' })
    wiredPlan({ error, data }) {
        if (data) {
            this.plan = data;
            this.error = undefined;
        } else if (error) {
            this.error = error;
            this.plan = undefined;
        }
    }

    get plainGoals() {
        return this.plan && this.plan.Goals__c ? this.stripHtml(this.plan.Goals__c) : '';
    }

    get plainIssues() {
        return this.plan && this.plan.Issues__c ? this.stripHtml(this.plan.Issues__c) : '';
    }

    stripHtml(html) {
        // Remove HTML tags using DOMParser (safer than regex)
        const div = document.createElement('div');
        div.innerHTML = html;
        return div.textContent || div.innerText || '';
    }

    handleCreatePlan() {
        // Calculate first and last day of the current year
        const year = new Date().getFullYear();
        const startDate = `${year}-01-01`;
        const endDate = `${year}-12-31`;

        const defaultFieldValues = encodeDefaultFieldValues({
            Account__c: this.recordId,
            Start_Date__c: startDate,
            End_Date__c: endDate
        });

        this[NavigationMixin.Navigate]({
            type: 'standard__objectPage',
            attributes: {
                objectApiName: 'Account_Plan__c',
                actionName: 'new'
            },
            state: {
                defaultFieldValues
            }
        });
    }

    handleEditPlan() {
        this[NavigationMixin.Navigate]({
            type: 'standard__recordPage',
            attributes: {
                recordId: this.plan.Id,
                objectApiName: 'Account_Plan__c',
                actionName: 'edit'
            }
        });
    }
}