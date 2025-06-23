import { LightningElement, api, wire } from 'lwc';
import { getRecord, getFieldValue } from 'lightning/uiRecordApi';
import getWeatherSummary from '@salesforce/apex/WeatherService.getWeatherSummary';

const LAT_FIELD = 'Hunt_Area__c.Hunt_Area_Center__Latitude__s';
const LONG_FIELD = 'Hunt_Area__c.Hunt_Area_Center__Longitude__s';
const FIELDS = [LAT_FIELD, LONG_FIELD];

export default class WeatherComponent extends LightningElement {
    @api recordId;
    latitude;
    longitude;
    latRounded;
    lonRounded;
    pointsUrl;
    observationStationsUrl;
    firstStationUrl;
    temperatureF;
    windDirection;
    windCompass;
    windSpeedMph;
    barometricPressureInches;
    precipitationLast6HoursInches;

    @wire(getRecord, { recordId: '$recordId', fields: FIELDS })
    wiredRecord({ data }) {
        if (data) {
            this.latitude = getFieldValue(data, LAT_FIELD);
            this.longitude = getFieldValue(data, LONG_FIELD);
            if (this.latitude != null && this.longitude != null) {
                getWeatherSummary({ latitude: this.latitude, longitude: this.longitude })
                    .then(summary => {
                        this.pointsUrl = 'https://api.weather.gov/points/' + this.latitude + ',' + this.longitude;
                        this.latRounded = summary.latRounded;
                        this.lonRounded = summary.lonRounded;
                        this.observationStationsUrl = summary.observationStationsUrl;
                        this.firstStationUrl = summary.firstStationUrl;
                        this.temperatureF = summary.temperatureF;
                        this.windDirection = summary.windDirection;
                        this.windCompass = summary.windCompass;
                        this.windSpeedMph = summary.windSpeedMph;
                        this.barometricPressureInches = summary.barometricPressureInches;
                        this.precipitationLast6HoursInches = summary.precipitationLast6HoursInches;
                    })
                    .catch(() => {
                        this.pointsUrl = undefined;
                        this.latRounded = undefined;
                        this.lonRounded = undefined;
                        this.observationStationsUrl = undefined;
                        this.firstStationUrl = undefined;
                        this.temperatureF = undefined;
                        this.windDirection = undefined;
                        this.windCompass = undefined;
                        this.windSpeedMph = undefined;
                        this.barometricPressureInches = undefined;
                        this.precipitationLast6HoursInches = undefined;
                    });
            }
        }
    }
}