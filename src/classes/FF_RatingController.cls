public with sharing class FF_RatingController {

//    @AuraEnabled
//    public static List<FF_Product_Rating__c> fetchRatings(String productId){
//        List<FF_Product_Rating__c> ratings = [SELECT Id,FF_Comment__c,FF_Score__c,CreatedDate,CreatedBy.Name,CreatedBy.SmallPhotoUrl,CreatedById FROM FF_Product_Rating__c WHERE FF_Product__c = :productId ORDER BY CreatedDate DESC];
//        return ratings;
//    }

    @AuraEnabled
    public static RatingWrapper fetchRatings(String productId){
        List<FF_Product_Rating__c> ratings = [SELECT Id,FF_Comment__c,FF_Score__c,CreatedDate,CreatedBy.Name,CreatedBy.SmallPhotoUrl,CreatedById FROM FF_Product_Rating__c WHERE FF_Product__c = :productId ORDER BY CreatedDate DESC];
        RatingWrapper ratingWrapper = new RatingWrapper(ratings);
        return ratingWrapper;
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

    public class RatingWrapper {
        @AuraEnabled public List<FF_Product_Rating__c> ratings {get;set;}
        @AuraEnabled public Decimal average {get;set;}

        public RatingWrapper(List<FF_Product_Rating__c> ratings){
            this.ratings = ratings;
            calculateAverage();
        }

        private Decimal calculateAverage(){
            average = 0;
            if(!ratings.isEmpty()){
                Decimal ratingSum = 0;
                Integer ratingCount = 0;
                for(FF_Product_Rating__c rating : ratings){
                    if(rating.FF_Score__c!=null && rating.FF_Score__c>0){
                        ratingSum += rating.FF_Score__c;
                        ratingCount += 1;
                    }
                }
                if(ratingCount > 0){
                    average = ratingSum/ratingCount;
                    average = average.setScale(2, RoundingMode.HALF_UP);
                }
            }
            return average;
        }
    }

}