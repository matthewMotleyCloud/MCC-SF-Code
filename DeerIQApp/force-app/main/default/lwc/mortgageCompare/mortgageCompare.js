import { LightningElement } from 'lwc';

export default class MortgageCompare extends LightningElement {
    calc1 = {};
    calc2 = {};

    handleCalc1(event) {
        this.calc1 = event.detail;
    }
    handleCalc2(event) {
        this.calc2 = event.detail;
    }

    get showDelta() {
        return (
            this.calc1.totalDue !== undefined &&
            this.calc2.totalDue !== undefined
        );
    }

    get deltaTotalDue() {
        if (!this.showDelta) return '';
        return (this.calc2.totalDue - this.calc1.totalDue ).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }
    
    get deltaMonthlyPayment() {
        if (!this.showDelta) return '';
        return (this.calc2.monthlyPayment - this.calc1.monthlyPayment).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }
    get deltaTotalInterest() {
        if (!this.showDelta) return '';
        return (this.calc2.totalInterest - this.calc1.totalInterest).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }
}