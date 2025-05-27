import { LightningElement, track } from 'lwc';

export default class MortgageCalc extends LightningElement {
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
        this.handleCalculate(); // Automatically calculate upon input change
    }

    handleCalculate() {
        const principal = parseFloat(this.principal);
        const annualRate = parseFloat(this.rate);
        const months = parseInt(this.months, 10);

        if (isNaN(principal) || isNaN(annualRate) || isNaN(months) || months === 0) {
            this.totalDue = '';
            this.monthlyPayment = '';
            this.totalInterest = '';
            return;
        }

        const monthlyRate = annualRate / 12 / 100;
        let monthlyPayment;

        if (monthlyRate === 0) {
            // No interest case
            monthlyPayment = principal / months;
        } else {
            monthlyPayment = principal * (monthlyRate * Math.pow(1 + monthlyRate, months)) /
                (Math.pow(1 + monthlyRate, months) - 1);
        }

        const totalDue = monthlyPayment * months;
        const totalInterest = totalDue - principal;

        this.totalDue = `$${totalDue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
        this.monthlyPayment = `$${monthlyPayment.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
        this.totalInterest = `$${totalInterest.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

        // Fire event with raw numbers
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
        this.totalDue = '';
        this.monthlyPayment = '';
        this.totalInterest = '';
    }
}