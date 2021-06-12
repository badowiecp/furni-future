public with sharing class FF_ProductRatingTriggerHelper {

    public static void checkIfAlreadyRated(List<FF_Product_Rating__c> newRatings){
        List<FF_Product_Rating__c> currentRatings = [SELECT Id,FF_Product__c,FF_Score__c,OwnerId FROM FF_Product_Rating__c WHERE OwnerId =:UserInfo.getUserId()];
        for(FF_Product_Rating__c newRating : newRatings){
            if(newRating.FF_Score__c!=null){
                for(FF_Product_Rating__c currentRating : currentRatings){
                    if(newRating.FF_Product__c==currentRating.FF_Product__c && currentRating.FF_Score__c!=null){
                        System.debug(currentRating);
                        System.debug(newRating);
                        newRating.addError('You have already rated this product');
                    }
                }
            }
        }
    }

}