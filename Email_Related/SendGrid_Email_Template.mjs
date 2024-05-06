//Required Packages
import dotenv from 'dotenv'
dotenv.config({ path: "../.env" });
import sgMail from '@sendgrid/mail';


//JS Code
import logger from './Error_Logger_Template.mjs'


//Call Synchronous Process
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const msg  = {
    to:'recipient@email_provider.com',
    from: 'sender@company.com',
    subject: 'Sending Email with Sendgrid is Fun',
    text: 'Test Message from Sendgrid API using NodeJS',
    html: '<strong>Test Message from Sendgrid API NodeJS HTML Message</strong>',
}

sgMail
.send(msg)
.then(() => { 
    console.log("Email Eent Successfully to the Recipient"); 
})
.catch((err) => { 
    logger.error("There was an error sending this email" + (err||err.stack));
});