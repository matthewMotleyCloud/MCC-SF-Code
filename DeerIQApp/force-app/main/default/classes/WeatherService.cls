public with sharing class WeatherService {
    @AuraEnabled(cacheable=true)
    public static Map<String, Object> getWeatherSummary(Decimal latitude, Decimal longitude) {
        Map<String, Object> result = new Map<String, Object>();

        // Round latitude and longitude to 4 decimals
        Decimal latRounded = latitude.setScale(4, RoundingMode.HALF_UP);
        Decimal lonRounded = longitude.setScale(4, RoundingMode.HALF_UP);
        result.put('latRounded', latRounded);
        result.put('lonRounded', lonRounded);

        // 1. Get points URL
        String pointsUrl = 'https://api.weather.gov/points/' + latRounded + ',' + lonRounded;
        Http http = new Http();
        HttpRequest req = new HttpRequest();
        req.setEndpoint(pointsUrl);
        req.setMethod('GET');
        req.setHeader('User-Agent', 'SalesforceLWC/1.0');
        HttpResponse res = http.send(req);
        if (res.getStatusCode() != 200) throw new AuraHandledException('Failed to get points data');
        Map<String, Object> root = (Map<String, Object>) JSON.deserializeUntyped(res.getBody());
        Map<String, Object> properties = (Map<String, Object>) root.get('properties');
        String observationStationsUrl = (String) properties.get('observationStations');
        result.put('observationStationsUrl', observationStationsUrl);

        // 2. Get stations
        req = new HttpRequest();
        req.setEndpoint(observationStationsUrl);
        req.setMethod('GET');
        req.setHeader('User-Agent', 'SalesforceLWC/1.0');
        res = http.send(req);
        if (res.getStatusCode() != 200) throw new AuraHandledException('Failed to get observation stations');
        root = (Map<String, Object>) JSON.deserializeUntyped(res.getBody());
        List<Object> stations = (List<Object>) root.get('observationStations');
        if (stations == null || stations.isEmpty()) throw new AuraHandledException('No observation stations found');
        String firstStationUrl = (String) stations[0];
        result.put('firstStationUrl', firstStationUrl);

        // 3. Get latest observation
        String obsUrl = firstStationUrl + '/observations/latest';
        req = new HttpRequest();
        req.setEndpoint(obsUrl);
        req.setMethod('GET');
        req.setHeader('User-Agent', 'SalesforceLWC/1.0');
        res = http.send(req);
        if (res.getStatusCode() != 200) throw new AuraHandledException('Failed to get station observation');
        root = (Map<String, Object>) JSON.deserializeUntyped(res.getBody());
        properties = (Map<String, Object>) root.get('properties');

        // Extract and convert values
        Map<String, Object> temp = (Map<String, Object>) properties.get('temperature');
        Decimal tempC = temp != null && temp.get('value') != null ? (Decimal) temp.get('value') : null;
        Decimal tempF = tempC != null ? (tempC * 9/5) + 32 : null;
        Decimal tempFRounded = tempF != null ? tempF.setScale(1, RoundingMode.HALF_UP) : null;
        result.put('temperatureF', tempFRounded);

        Map<String, Object> windDir = (Map<String, Object>) properties.get('windDirection');
        Decimal windDeg = windDir != null && windDir.get('value') != null ? (Decimal) windDir.get('value') : null;
        String windComp = null;
        if (windDeg != null) {
            // 16 compass points
            List<String> dirs = new List<String>{'N','NNE','NE','ENE','E','ESE','SE','SSE','S','SSW','SW','WSW','W','WNW','NW','NNW'};
            Integer idx = Integer.valueOf(Math.floor(((Double)windDeg / 22.5) + 0.5));
            while (idx >= 16) { idx -= 16; }
            windComp = dirs[idx];
        }
        result.put('windDirection', windDir != null ? windDir.get('value') : null);
        result.put('windCompass', windComp);

        Map<String, Object> windSpeed = (Map<String, Object>) properties.get('windSpeed');
        Decimal windKmh = windSpeed != null && windSpeed.get('value') != null ? (Decimal) windSpeed.get('value') : null;
        Decimal windMph = windKmh != null ? (windKmh * 0.621371) : null;
        Decimal windMphRounded = windMph != null ? windMph.setScale(1, RoundingMode.HALF_UP) : null;
        result.put('windSpeedMph', windMphRounded);

        // Barometric Pressure (Pa to inHg: 1 inHg = 3386.389 Pa)
        Map<String, Object> baro = (Map<String, Object>) properties.get('barometricPressure');
        Decimal baroPa = baro != null && baro.get('value') != null ? (Decimal) baro.get('value') : null;
        Decimal baroInches = baroPa != null ? (baroPa / 3386.389) : null;
        Decimal baroInchesRounded = baroInches != null ? baroInches.setScale(2, RoundingMode.HALF_UP) : null;
        result.put('barometricPressureInches', baroInchesRounded);

        // Precipitation Last 6 Hours (mm to inches: 1 inch = 25.4 mm)
        Map<String, Object> precip6 = (Map<String, Object>) properties.get('precipitationLast6Hours');
        Decimal precipMm = precip6 != null && precip6.get('value') != null ? (Decimal) precip6.get('value') : null;
        Decimal precipInches = precipMm != null ? (precipMm / 25.4) : null;
        result.put('precipitationLast6HoursInches', precipInches);

        return result;
    }
}