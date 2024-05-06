//Required Packages
import dotenv from 'dotenv'
dotenv.config({ path: "../.env" });
import nodemailer from 'nodemailer';
import pkg from 'winston';
const { transport } = pkg;


//Set Up Configuration (This is an example for Office365)
let emailConfig = {
    service: "Outlook365",
    host: "smtp.office365.com",
    port: 5587,
    secureConnection: false,
    requireTLS: false,
    auth: {
        user: process.env.MAILER_EMAIL_USERNAME,
        pass: process.env.MAILER_EMAIL_PASSWORD
    }
};

//Set Up Transporter
let transporter = nodemailer.createTransport(emailConfig);


//Call Function & Create Export at the Same Time
export default {

    isExport: async function (dir) {

        let isExport = await transporter.sendMail({
            from: '"Mailer Service Name" <mailer_service@company.com>',
            to: "recipient@company.com",
            subject: "Export of .json attachment",
            attachments: [
                {
                    path: dir
                }
            ]
        });
    }
};