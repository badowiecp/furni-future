public with sharing class FF_RatingController {

    @AuraEnabled
    public static List<FF_Product_Rating__c> fetchRatings(String productId){
        List<FF_Product_Rating__c> ratings = [SELECT Id,FF_Comment__c,FF_Score__c,CreatedDate,CreatedBy.Name,CreatedBy.SmallPhotoUrl,CreatedById FROM FF_Product_Rating__c WHERE FF_Product__c = :productId ORDER BY CreatedDate DESC];
        System.debug(ratings);
        return ratings;
    }

    @AuraEnabled
    public static String getUserId(){
        return UserInfo.getUserId();
    }

    @AuraEnabled
    public static void deleteRating(String ratingId){
        FF_Product_Rating__c rating = new FF_Product_Rating__c();
        rating.Id = ratingId;
        delete rating;
    }

}