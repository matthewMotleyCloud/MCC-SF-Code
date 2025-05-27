import { LightningElement, track } from 'lwc';

export default class Magic8Ball extends LightningElement {
    @track thinking = false;
    @track response = '';

    handleClick() {
        this.thinking = true;
        this.response = '';
        setTimeout(() => {
            this.thinking = false;
            this.response = this.getRandomResponse();
        }, 1500); // Simulate thinking time
    }

    getRandomResponse() {
        const responses = [
            'Yes',
            'No',
            'Maybe',
            'Ask again later',
            'Definitely not',
            'Absolutely',
            'I wouldn\'t count on it',
            'No way Jose!',
            'No, no, no, no, no, no!',
            'Yes, yes, yes, yes, yes!',
            'I don\'t know, go ask your mom!'
        ];
        const randomIndex = Math.floor(Math.random() * responses.length);
        return responses[randomIndex];
    }
}