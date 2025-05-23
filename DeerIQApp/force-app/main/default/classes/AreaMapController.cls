public with sharing class AreaMapController {
    @AuraEnabled(cacheable=true)
    public static List<Pin__c> getPinsForArea(Id huntAreaId) {
        return [
            SELECT Id, Name, Geolocation__Latitude__s, Geolocation__Longitude__s 
            FROM Pin__c 
            WHERE Hunt_Area__c = :huntAreaId 
                AND Geolocation__Latitude__s != null
                AND Geolocation__Longitude__s != null
        ];

    }
}