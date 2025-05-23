public with sharing class WeatherService {
    @AuraEnabled(cacheable=true)
    public static String getWeatherData(Decimal latitude, Decimal longitude) {
        String endpoint = 'https://api.weather.gov/points/' + latitude + ',' + longitude;
        System.debug('Weather API Endpoint: ' + endpoint);
        

        HttpRequest req = new HttpRequest();
        req.setEndpoint(endpoint);
        req.setMethod('GET');
        req.setHeader('User-Agent', 'SalesforceLWC/1.0');

        Http http = new Http();
        HttpResponse res = http.send(req);

        if(res.getStatusCode() == 200) {
            return res.getBody();
        } else if(res.getStatusCode() == 404) {
            throw new AuraHandledException('Weather data not available for this location.');
        } else {
            throw new AuraHandledException('Error fetching weather data from API: ' + res.getStatus());
        }
    }
}