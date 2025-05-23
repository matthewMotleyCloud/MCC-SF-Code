import { LightningElement, api, wire } from 'lwc';
import { getRecord , getFieldValue} from 'lightning/uiRecordApi';
import getPinsForArea from '@salesforce/apex/AreaMapController.getPinsForArea';

const NAME = 'Hunt_Area__c.Name';
const LOCATION_LATITUDE = 'Hunt_Area__c.Hunt_Area_Center__Latitude__s';
const LOCATION_LONGITUDE = 'Hunt_Area__c.Hunt_Area_Center__Longitude__s';
const MILE_RADIUS = 'Hunt_Area__c.Mile_Radius__c';

const areaFields = [
    LOCATION_LATITUDE,
    LOCATION_LONGITUDE, 
    MILE_RADIUS, 
    NAME];

export default class AreaMap extends LightningElement {
    @api recordId;
    name;
    mapMarkers = [];
    @wire(getRecord, { recordId: '$recordId', fields: areaFields })
    wiredrecord({ error, data }) {
        if (error) {
            console.error('Error fetching record:', error);
        } else if (data) {
            this.name = getFieldValue(data, NAME);
            const Latitude = getFieldValue(data, LOCATION_LATITUDE);
            const Longitude = getFieldValue(data, LOCATION_LONGITUDE);
            const radius = getFieldValue(data, MILE_RADIUS);

            this.mapMarkers = [
                {
                    location: {
                        Latitude,
                        Longitude
                    },
                },
                {
                    location: {
                        Latitude,
                        Longitude
                    },
                    type: 'Circle',
                    radius: radius * 1609.34, // Convert miles to meters
                    strokeColor: '#FFF000',
                    strokeOpacity: 0.8,
                    strokeWeight: 2,
                    fillColor: '#FFF000',
                    fillOpacity: 0.35,
                }
            ];
        }
    }
    @wire(getPinsForArea, { huntAreaId: '$recordId' })
    wiredPins({ error, data }) {
        if (data) {
            const pinMarkers = data.map(pin => ({
                location: {
                    Latitude: pin.Geolocation__Latitude__s,
                    Longitude: pin.Geolocation__Longitude__s
                },
                title: pin.Name,
                time: pin.Time__c,
                description: pin.Description__c,
                icon: 'utility:flag'
            }));
            this.mapMarkers = [...this.mapMarkers, ...pinMarkers];
        } else if (error) {
            console.error('Error fetching pins: ', error);
        }
    }
}