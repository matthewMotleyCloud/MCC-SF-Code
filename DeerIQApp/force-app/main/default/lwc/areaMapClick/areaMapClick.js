import { LightningElement } from 'lwc';

export default class AreaMap extends LightningElement {
    map;
    marker;

    renderedCallback() {
        if (this.map) return; // Prevent re-initialization

        // Load Google Maps JS API (replace YOUR_API_KEY with a real key)
        const script = document.createElement('script');
        script.src = 'https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY';
        script.onload = () => this.initMap();
        this.template.querySelector('.map').appendChild(script);
    }

    initMap() {
        // Set initial center
        const center = { lat: 44.9, lng: -93.52 };
        this.map = new window.google.maps.Map(this.template.querySelector('.map'), {
            center,
            zoom: 12,
        });

        // Listen for clicks
        this.map.addListener('click', (e) => {
            const lat = e.latLng.lat();
            const lng = e.latLng.lng();

            // Place or move marker
            if (this.marker) {
                this.marker.setPosition({ lat, lng });
            } else {
                this.marker = new window.google.maps.Marker({
                    position: { lat, lng },
                    map: this.map,
                });
            }

            // Dispatch event with new coordinates
            this.dispatchEvent(new CustomEvent('mapclick', {
                detail: { latitude: lat, longitude: lng }
            }));
        });
    }
}