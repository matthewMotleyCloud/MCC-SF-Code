import { LightningElement, wire, api } from 'lwc';
import jsPDFLibrary from '@salesforce/resourceUrl/jsPDFLibrary';
import autoTable from '@salesforce/resourceUrl/autoTable';
import MotleyCloudConsultingLogo from '@salesforce/resourceUrl/MotleyCloudConsultingLogo';
import { loadScript } from 'lightning/platformResourceLoader';
import { getRecord, getFieldValue } from 'lightning/uiRecordApi';
import { getRelatedListRecords } from 'lightning/uiRelatedListApi';

import NAME_FIELD from '@salesforce/schema/Invoice__c.Name';
import SUBMITTED_DATE_FIELD from '@salesforce/schema/Invoice__c.Submitted_On__c';
import HOURLY_RATE_FIELD from '@salesforce/schema/Invoice__c.Hourly_Rate__c';
import BILLING_TYPE_FIELD from '@salesforce/schema/Invoice__c.Billing_Type__c';
import PAYMENT_DUE_FIELD from '@salesforce/schema/Invoice__c.Payment_Due__c';
import PROJECT_FIELD from '@salesforce/schema/Invoice__c.Project__c';
import AMOUNT_DUE_FIELD from '@salesforce/schema/Invoice__c.Amount_Due__c';
import ACCOUNT_FIELD from '@salesforce/schema/Invoice__c.Account__c';
import OWNER_ID_FIELD from '@salesforce/schema/Invoice__c.OwnerId';
import REPORTING_TO_1_NAME_FIELD from '@salesforce/schema/Invoice__c.Reporting_To_1__r.Name';
import REPORTING_TO_2_NAME_FIELD from '@salesforce/schema/Invoice__c.Reporting_To_2__r.Name';

const fields = [
    NAME_FIELD,
    SUBMITTED_DATE_FIELD,
    HOURLY_RATE_FIELD,
    BILLING_TYPE_FIELD,
    PAYMENT_DUE_FIELD,
    AMOUNT_DUE_FIELD,
    PROJECT_FIELD,
    ACCOUNT_FIELD,
    OWNER_ID_FIELD,
    REPORTING_TO_1_NAME_FIELD,
    REPORTING_TO_2_NAME_FIELD
];

// Related Account fields.
const ACCOUNT_FIELDS = [
    'Account.Name', 
    'Account.BillingStreet', 
    'Account.BillingCity', 
    'Account.BillingState', 
    'Account.BillingPostalCode'
];

// Owner fields to fetch
const OWNER_FIELDS = [
    'User.CompanyName',
    'User.Street',
    'User.City',
    'User.State',
    'User.PostalCode',
    'User.Email',
    'User.MobilePhone'
];

/*const REPORTING_TO_1_FIELDS = [
    'Reporting_To_1__r.Name',
    'Reporting_To_1__r.Email'
];
const REPORTING_TO_2_FIELDS = [
    'Reporting_To_2__r.Name',
    'Reporting_To_2__r.Email'
];*/

export default class GenerateInvoicePDF extends LightningElement {
    jsPDFInitialized = false;

    @api recordId;
    name;
    submittedDate;
    hourlyRate;
    billingType;
    paymentDue;
    amountDue;
    project;
    accountName;
    accountBillingStreet;
    accountBillingCity;
    accountBillingState;
    accountBillingPostal;
    accountId;
    timeLogs = [];
    ownerId;
    ownerCompanyName;
    ownerStreet;
    ownerCity;
    ownerState;
    ownerPostalCode;
    ownerEmail;
    ownerMobile;
    //repTo1Id;
    repTo1Name;
    //repTo2Id;
    repTo2Name;

    @wire(getRecord, { recordId: '$recordId', fields })
    invoiceData({ data, error }) {
        if (data) {
            console.log('Invoice Data: ' + JSON.stringify(data));
            this.name = getFieldValue(data, NAME_FIELD) || 'N/A';
            this.submittedDate = this.formatDate(getFieldValue(data, SUBMITTED_DATE_FIELD)) || 'N/A';
            this.hourlyRate = getFieldValue(data, HOURLY_RATE_FIELD); // No formatting here
            this.billingType = getFieldValue(data, BILLING_TYPE_FIELD) || 'N/A';
            this.paymentDue = this.formatDate(getFieldValue(data, PAYMENT_DUE_FIELD)) || 'N/A';
            this.amountDue = this.formatCurrency(getFieldValue(data, AMOUNT_DUE_FIELD)) || '$0.00';
            this.project = getFieldValue(data, PROJECT_FIELD) || 'N/A';
            this.accountId = getFieldValue(data, ACCOUNT_FIELD);
            this.ownerId = getFieldValue(data, OWNER_ID_FIELD);
            this.repTo1Name = getFieldValue(data, REPORTING_TO_1_NAME_FIELD);
            this.repTo2Name = getFieldValue(data, REPORTING_TO_2_NAME_FIELD);
        } else if (error) {
            console.error('Error fetching Invoice record: ', JSON.stringify(error));
        }
    }

    @wire(getRecord, { recordId: '$accountId', fields: ACCOUNT_FIELDS })
    accountData({ data, error }) {
        if (data) {
            this.accountName = getFieldValue(data, 'Account.Name') || 'N/A';
            this.accountBillingStreet = getFieldValue(data, 'Account.BillingStreet') || 'N/A';
            this.accountBillingCity = getFieldValue(data, 'Account.BillingCity') || 'N/A';
            this.accountBillingState = getFieldValue(data, 'Account.BillingState') || 'N/A';
            this.accountBillingPostal = getFieldValue(data, 'Account.BillingPostalCode') || 'N/A';
        } else if (error) {
            console.error('Error fetching Account record: ', JSON.stringify(error));
            this.accountName = 'N/A';
            this.accountBillingStreet = 'N/A';
            this.accountBillingCity = 'N/A';
            this.accountBillingState = 'N/A';
            this.accountBillingPostal = 'N/A';
        }
    }

    @wire(getRecord, { recordId: '$ownerId', fields: OWNER_FIELDS })
    ownerData({ data, error }) {
        if (data) {
            this.ownerCompanyName = getFieldValue(data, 'User.CompanyName');
            this.ownerStreet = getFieldValue(data, 'User.Street');
            this.ownerCity = getFieldValue(data, 'User.City');
            this.ownerState = getFieldValue(data, 'User.State');
            this.ownerPostalCode = getFieldValue(data, 'User.PostalCode');
            this.ownerEmail = getFieldValue(data, 'User.Email');
            this.ownerMobile = getFieldValue(data, 'User.MobilePhone');
        } else if (error) {
            console.error('Error fetching Owner record: ', JSON.stringify(error));
            this.ownerCompanyName = 'N/A';
            this.ownerStreet = 'N/A';
            this.ownerCity = 'N/A';
            this.ownerState = 'N/A';
            this.ownerPostalCode = 'N/A';
            this.ownerEmail = 'N/A';
            this.ownerMobile = 'N/A';
        }
    }

    @wire(getRelatedListRecords, {
        parentRecordId: '$recordId',
        relatedListId: 'Time_Logs__r',
        fields: [
            'Time_Log__c.Start_Time__c', 
            'Time_Log__c.Description__c', 
            'Time_Log__c.Hours__c', 
            'Time_Log__c.Amount_Due__c'
        ]
    })

    relatedTimeLogs({ data, error }) {
        if (data) {
            this.timeLogs = data.records.map(record => ({
                date: this.formatDate(getFieldValue(record, 'Time_Log__c.Start_Time__c')),
                description: getFieldValue(record, 'Time_Log__c.Description__c'),
                hours: getFieldValue(record, 'Time_Log__c.Hours__c'),
                fee: this.formatCurrency(getFieldValue(record, 'Time_Log__c.Amount_Due__c'))
            }));
        } else if (error) {
            console.error('Error fetching related Time Logs: ', error);
        }
    }

    formatDate(date) {
        if (!date) return 'N/A'; // Return 'N/A' for null or undefined dates
        const d = new Date(date);
    
        // Adjust for timezone offset to ensure the correct date
        const adjustedDate = new Date(d.getTime() + d.getTimezoneOffset() * 60000);
    
        let month = '' + (adjustedDate.getMonth() + 1);
        let day = '' + adjustedDate.getDate();
        const year = adjustedDate.getFullYear();
    
        if (month.length < 2) month = '0' + month;
        if (day.length < 2) day = '0' + day;
    
        return [month, day, year].join('/');
    }

    formatCurrency(amount) {
        if (amount == null) {
            return '$0.00';
        }
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    }

    renderedCallback() {
        if (!this.jsPDFInitialized) {
            this.jsPDFInitialized = true;
            Promise.all([
                loadScript(this, jsPDFLibrary),
                loadScript(this, autoTable)
            ])
                .then(() => {
                    console.log('jsPDF and autoTable libraries loaded successfully');
                })
                .catch((error) => {
                    console.error('Error loading jsPDF or autoTable library: ', error);
                });
        }
    }

    generatePDF() {
        console.log('generatePDF called');
        if (this.jsPDFInitialized && window.jspdf) {
            try {
                const { jsPDF } = window.jspdf;
                const margin = 36; // 0.5 inches in points
                const doc = new jsPDF({
                    unit: 'pt',
                    format: 'letter',
                    margins: { top: margin, bottom: margin, left: margin, right: margin }
                });

                const imageHeight = 105; // Desired height
                const imageWidth = 150; // Desired width
                const xPosition = doc.internal.pageSize.width - margin - imageWidth; // Top-right corner
                const yPosition = margin; // Top margin

                // Load the static resource image
                fetch(MotleyCloudConsultingLogo)
                    .then(response => response.blob())
                    .then(blob => {
                        const reader = new FileReader();
                        reader.onload = () => {
                            const imageData = reader.result; // Base64 string of the image
                            doc.addImage(imageData, 'PNG', xPosition, yPosition, imageWidth, imageHeight);

                            // Add the rest of the PDF content
                            this.addPDFContent(doc, margin);
                        };
                        reader.readAsDataURL(blob); // Convert the blob to a base64 string
                    })
                    .catch(error => {
                        console.error('Error loading image: ', error);

                        // Proceed without the image if it fails to load
                        this.addPDFContent(doc, margin);
                    });
            } catch (error) {
                console.error('Error generating PDF: ', error);
            }
        } else {
            console.error('jsPDF library is not loaded or initialized');
        }
    }

    // Helper method to add the rest of the PDF content
    addPDFContent(doc, margin) {
        let y = margin;
        const leftMargin = margin;

        doc.setFontSize(13);
        doc.setFont('helvetica', 'bold');

        // Owner Information
        if (this.ownerCompanyName) {
            doc.text(this.ownerCompanyName, leftMargin, y);
            y += 14;
        }

        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        if (this.ownerStreet) {
            doc.text(this.ownerStreet, leftMargin, y);
            y += 14;
        }
        const cityStateZip = `${this.ownerCity || ''}${this.ownerCity && (this.ownerState || this.ownerPostalCode) ? ', ' : ''}${this.ownerState || ''}${this.ownerState && this.ownerPostalCode ? ' ' : ''}${this.ownerPostalCode || ''}`;
        if (cityStateZip) {
            doc.text(cityStateZip, leftMargin, y);
            y += 14;
        }
        if (this.ownerEmail) {
            doc.text(this.ownerEmail, leftMargin, y);
            y += 14;
        }
        if (this.ownerMobile) {
            doc.text(this.ownerMobile, leftMargin, y);
            y += 40;
        }

        doc.setFontSize(13);
        doc.setFont('helvetica', 'bold');

        doc.text(`Invoice #: ${this.name}`, leftMargin, y);
        y += 35;

        doc.setFontSize(10);

        const pageWidth = doc.internal.pageSize.width;
        const sectionWidth = (pageWidth - 2 * margin) / 3; // Divide the available width into three equal sections

        // Submitted On Column
        doc.setFont('helvetica', 'bold');
        doc.text('Submitted On', margin, y);
        doc.setFont('helvetica', 'normal');
        doc.text(`${this.submittedDate}`, margin, y + 14);

        // Payable To Column
        doc.setFont('helvetica', 'bold');
        doc.text('Payable To', margin + sectionWidth, y);
        doc.setFont('helvetica', 'normal');
        doc.text(`${this.ownerCompanyName}`, margin + sectionWidth, y + 14);

        // Due By Column
        doc.setFont('helvetica', 'bold');
        doc.text('Due By', margin + 2 * sectionWidth, y);
        doc.setFont('helvetica', 'normal');
        doc.text(`${this.paymentDue}`, margin + 2 * sectionWidth, y + 14);

        y += 40; // Adjust y for the next section

        // Invoice for
        doc.setFont('helvetica', 'bold');
        doc.text('Invoice For', margin, y);
        doc.setFont('helvetica', 'normal');
        doc.text(`${this.accountName}`, margin, y + 14);
        doc.text(`${this.accountBillingStreet}`, margin, y + 28);
        doc.text(`${this.accountBillingCity}, ${this.accountBillingState} ${this.accountBillingPostal}`, margin, y + 42);

        // Project
        doc.setFont('helvetica', 'bold');
        doc.text('Project', margin + sectionWidth, y);
        doc.setFont('helvetica', 'normal');
        doc.text(`${this.project}`, margin + sectionWidth, y + 14);

        // Reporting To
        doc.setFont('helvetica', 'bold');
        doc.text('Reporting To', margin + 2 * sectionWidth, y);
        doc.setFont('helvetica', 'normal');

        // Handle Reporting To fields
        let reportingToText = '';
        if (this.repTo1Name && this.repTo2Name) {
            reportingToText = `${this.repTo1Name}/${this.repTo2Name}`;
        } else if (this.repTo1Name) {
            reportingToText = this.repTo1Name;
        } else if (this.repTo2Name) {
            reportingToText = this.repTo2Name;
        }

        // Only add text if there is something to display
        if (reportingToText) {
            doc.text(reportingToText, margin + 2 * sectionWidth, y + 14);
        }

        // Billing Type
        doc.setFont('helvetica', 'bold');
        doc.text('Billing Type', margin + 2 * sectionWidth, y + 42);
        doc.setFont('helvetica', 'normal');
        doc.text(`${this.formatCurrency(this.hourlyRate)} ${this.billingType}`, margin + 2 * sectionWidth, y + 56);
        y += 70; // Adjust y for the next section

        // Time Log Table - Using autoTable
        const timeLogHeaders = ['Date', 'Description', 'Hours', 'Fee'];

        // Group time logs by date, sum hours, and concatenate descriptions
        const groupedLogs = {};
        this.timeLogs.forEach(log => {
            const date = log.date;
            if (!groupedLogs[date]) {
                groupedLogs[date] = { hours: 0, description: '', amountDue: 0 };
            }
            // Ensure hours and fee are numbers
            const hours = Number(log.hours) || 0;
            // Remove $ and commas for fee, then parse
            const fee = parseFloat((log.fee || '0').replace(/[^0-9.-]+/g,"")) || 0;
            groupedLogs[date].hours += hours;
            groupedLogs[date].amountDue += fee;
            groupedLogs[date].description += (groupedLogs[date].description ? ' | ' : '') + (log.description || '');
        });

        // Convert to array for PDF table
        const timeLogData = Object.entries(groupedLogs).map(([date, data]) => [
            date,
            data.description,
            Number(data.hours).toFixed(2), // limit to 2 decimals
            this.formatCurrency(data.amountDue) // format summed fee
        ]);

        // Ensure at least 20 points of space before the table
        y += 20;

        doc.autoTable({
            startY: y,
            head: [timeLogHeaders],
            body: timeLogData,
            theme: 'grid',
            styles: { font: 'helvetica', fontSize: 10, textColor: [0, 0, 0] },
            headStyles: { fillColor: [107, 172, 219], halign: 'center' },
            columnStyles: {
                0: { halign: 'center' }, // "Date" column
                2: { halign: 'center' }, // "Hours" column
                3: { halign: 'center' }  // "Fee" column
            },
            margin: { left: leftMargin, right: margin }
        });

        // Update y to the end of the table
        y = doc.lastAutoTable.finalY + 20;

        let totalHours = 0;
        let totalFee = 0;

        this.timeLogs.forEach(log => {
            totalHours += log.hours;
            totalFee += parseFloat(log.fee.replace('$', '').replace(',', ''));
        });

        // Limit totalHours to two decimals
        totalHours = parseFloat(totalHours.toFixed(2));

        const totalsY = y + 14;
        doc.setFontSize(13);
        doc.setFont('helvetica', 'bold');
        doc.text(`Total Hours: ${totalHours} | Amount Due: ${this.formatCurrency(totalFee)}`, doc.internal.pageSize.width - margin, totalsY + 14, { align: 'right' });

        // Save the PDF
        doc.save(`Motley Cloud Consulting Invoice ${this.name}.pdf`);
    }
}