trigger FF_QuoteTrigger on Quote_event__e (after insert) {

    FF_TriggerFactory.createHandler(Quote_event__e.SObjectType);

}