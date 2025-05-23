import { LightningElement, api, wire, track } from 'lwc';
import { getRecord, getFieldValue } from 'lightning/uiRecordApi';
import getWeatherData from '@salesforce/apex/WeatherService.getWeatherData';

const LAT_FIELD = 'Hunt_Area__c.Hunt_Area_Center__Latitude__s';
const LONG_FIELD = 'Hunt_Area__c.Hunt_Area_Center__Longitude__s';

const FIELDS = [LAT_FIELD, LONG_FIELD];

export default class WeatherComponent extends LightningElement {
    @api recordId;
    @track weather;
    @track error;

    @wire(getRecord, { recordId: '$recordId', fields: FIELDS })
    wiredRecord({ error, data }) {
        if (data) {
            const latitude = getFieldValue(data, LAT_FIELD);
            const longitude = getFieldValue(data, LONG_FIELD);

            if (latitude && longitude) {
                getWeatherData({ latitude, longitude })
                    .then(result => {
                        const weatherData = JSON.parse(result);
                        const period = weatherData.properties.periods[0];
                        this.weather = {
                            temp: period.temperature + ' ' + period.temperatureUnit,
                            wind: period.windDirection + ' ' + period.windSpeed,
                            shortForecast: period.shortForecast,
                            detailedForecast: period.detailedForecast
                        };
                        this.error = undefined;
                    })
                    .catch(e => {
                        this.error = 'Could not fetch weather: ' + (e.body?.message || e.message);
                        this.weather = undefined;
                    });
            } else {
                this.error = 'No latitude/longitude found on this Hunt Area.';
                this.weather = undefined;
            }
        } else if (error) {
            this.error = 'Could not fetch Hunt Area location.';
            this.weather = undefined;
        }
    }
}