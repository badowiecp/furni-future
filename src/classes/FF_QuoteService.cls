global without sharing class FF_QuoteService {

    global static void prepareQuoteForOpportunity(String opportunityId) {
        Quote newQuote = createQuote(opportunityId);
        createQuoteLineItems(newQuote, opportunityId);
        generatePdf(newQuote.Id,newQuote.OpportunityId,newQuote.Email,newQuote.ContactId);
    }

    private static Quote createQuote(String opportunityId) {
        Opportunity opportunity = [SELECT Id,Name,CreatedById,OwnerId,Owner.Email,CreatedBy.Email FROM Opportunity WHERE Id = :opportunityId];
        Quote newQuote = new Quote();
        newQuote.OpportunityId = opportunityId;
        Contact contact = [SELECT Id,Email FROM Contact WHERE Email = :opportunity.CreatedBy.Email];
        newQuote.ContactId = contact.Id;
        newQuote.Email = contact.Email;
        newQuote.Name = 'Quote for ' + opportunity.Name;
        insert newQuote;
        return newQuote;
    }

    private static void createQuoteLineItems(Quote quote, String opportunityId) {
        List<OpportunityLineItem> opportunityItems = [SELECT Id,UnitPrice,TotalPrice,Quantity,Product2Id,PricebookEntryId FROM OpportunityLineItem WHERE OpportunityId = :opportunityId];
        List<QuoteLineItem> quoteItems = new List<QuoteLineItem>();
        for (OpportunityLineItem opportunityItem : opportunityItems) {
            QuoteLineItem quoteItem = new QuoteLineItem();
            quoteItem.QuoteId = quote.Id;
            quoteItem.UnitPrice = opportunityItem.UnitPrice;
            quoteItem.Quantity = opportunityItem.Quantity;
            quoteItem.Product2Id = opportunityItem.Product2Id;
            quoteItem.PricebookEntryId = opportunityItem.PricebookEntryId;
            quoteItems.add(quoteItem);
        }
        insert quoteItems;
    }

    @future(callout=true)
    public static void generatePdf(String quoteId,String opportunityId, String email, String contactId) {
        String templateID = '0EH090000018wx1';
        String quoteUrl = '/quote/quoteTemplateDataViewer.apexp?id=';

        quoteUrl += quoteId;
        quoteUrl += '&headerHeight=190&footerHeight=188&summlid=';
        quoteUrl += templateID;
        quoteUrl += '#toolbar=1&navpanes=0&zoom=90';

        PageReference pg = new PageReference(quoteUrl);
        QuoteDocument quotedoc = new QuoteDocument();

        Blob b = pg.getContentAsPDF();

        quotedoc.Document = b;
        quotedoc.QuoteId = quoteId;
        insert quotedoc;
        sendEmail(opportunityId,email,quotedoc,contactId);
    }

    private static void sendEmail(String opportunityId, String email, QuoteDocument document, String contactId){
        Messaging.SingleEmailMessage message = new Messaging.SingleEmailMessage();
        message.setToAddresses(new String[] { email });
        List<OrgWideEmailAddress> addresses = [SELECT Id FROM OrgWideEmailAddress WHERE Address = 'patryk.badowiec@britenet.com.pl'];
        if (!addresses.isEmpty()) {
            message.setOrgWideEmailAddressId(addresses[0].Id);
        }
        message.setTargetObjectId(contactId);
        message.setSaveAsActivity(false);

        Messaging.EmailFileAttachment efa = new Messaging.EmailFileAttachment();
        efa.setFileName('Furni Future marketing quote');
        efa.setBody(document.Document);
        efa.setContentType('application/pdf');

        message.setFileAttachments(new List<Messaging.EmailFileAttachment>{efa});

        EmailTemplate template = [SELECT Id, Subject, HtmlValue FROM EmailTemplate WHERE Name = 'Quote notification'];

        message.setTemplateId(template.Id);
        message.setSubject(template.Subject);
        message.setHtmlBody(template.HtmlValue);
        message.setTreatBodiesAsTemplate(true);
        try {
            Messaging.sendEmail(new Messaging.SingleEmailMessage[] { message });
        } catch (Exception exc) {
            throw exc;
        }
    }
}