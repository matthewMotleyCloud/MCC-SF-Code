import { LightningElement, track } from 'lwc';

export default class CompIntCalc extends LightningElement {
    @track principal = '';
    @track rate = '';
    @track months = '';
    @track totalDue = '';
    @track monthlyPayment = '';
    @track totalInterest = '';

    handleInputChange(event) {
        this[event.target.name] = event.target.value;

        if (!this.principal || !this.rate || !this.months) {
            this.totalDue = '';
            this.monthlyPayment = '';
            this.totalInterest = '';
            return;
        }
        this.handleCalculate(); //Automatically calculate upon input change
    }

    handleCalculate() {
        const principal = parseFloat(this.principal);
        const rate = parseFloat(this.rate)/100;
        const months = parseInt(this.months, 10);
        const totalDue = principal * Math.pow((1 + rate / 12), months);
        const monthlyPayment = totalDue / months;
        const totalInterest = totalDue - principal;

        if (isNaN(principal) || isNaN(rate) || isNaN(months)) {
            this.result = 'Please enter valid numbers for all fields.';
            return;
        }

        
        this.totalDue = `$${totalDue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
        this.monthlyPayment = `$${monthlyPayment.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
        this.totalInterest = `$${totalInterest.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
        
        //Fire event with raw numbers
        const calcEvent = new CustomEvent('calculated', {
            detail: {
                totalDue,
                monthlyPayment,
                totalInterest
            }
        });
        this.dispatchEvent(calcEvent);
    }

    handleReset() {
        this.principal = '';
        this.rate = '';
        this.months = '';
        this.result = '';
    }
}