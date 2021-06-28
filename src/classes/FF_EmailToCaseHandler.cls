global without sharing class FF_EmailToCaseHandler implements Messaging.InboundEmailHandler{

    global Messaging.InboundEmailResult handleInboundEmail(Messaging.InboundEmail email, Messaging.Inboundenvelope envelope){
        Contact contact;
        Case newCase;
        String[] name;

        Messaging.InboundEmailResult result = new Messaging.InboundEmailResult();

        try{
            if([SELECT COUNT() FROM Contact WHERE Email = :email.fromAddress]!=0){
                contact = [SELECT Id FROM Contact WHERE Email = :email.fromAddress][0];
            }else{
                contact = new Contact();
                if(String.isNotEmpty(email.fromName)){
                    name = email.fromName.split(' ',2);
                    contact.FirstName = name[0];
                    contact.LastName = name[1];

                }
                contact.Email = email.fromAddress;
                insert contact;
            }
            newCase = new Case();
            newCase.ContactId = contact.Id;
            if(String.isNotEmpty(email.Subject)){
                newCase.Subject = email.Subject;
            }else{
                newCase.Subject = 'New email case without subject';
            }
            if(String.isNotEmpty(email.plainTextBody)){
                newCase.Description = email.plainTextBody;
            }

            newCase.Status = 'New';
            newCase.Priority = 'Medium';
            newCase.Origin = 'Email';
            insert newCase;

            result.success = true;

            return result;
        }catch (Exception exc){
            result.success = false;
            result.message = exc.getMessage();
            return result;
        }
    }

}