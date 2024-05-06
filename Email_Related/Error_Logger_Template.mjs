//Required Packages
import dotenv from 'dotenv'
dotenv.config({ path: "../.env" });
import winston from 'winston';
import pkg from 'dotenv'
const {NODE_ENV} = pkg;
import fse from "fs-extra";
import buffer from "buffer";
import path from 'path';
import * as url from 'url';
import  'winston-daily-rotate-file';
import * as winstonMail from 'winston-mail';


//Define Directory to Write Error Logs To
const __filename = url.fileURLToPath(new URL('.', import.meta.url));
const __dirname = path.dirname(__filename);
var logDir = (__dirname + '/Error_Log_Files/');               


//Make the Error Log Directory If It Doesn't Already Exist
if ( !fse.existsSync( logDir ) ) {
    fse.mkdirSync( logDir );
};
console.log('directory exists:  ' + logDir);

//Set Date
var now = new Date();


//Write Script
export const logger = winston.createLogger({
    transports: [

        new winston.transports.Console({level: 'error'}),
   
        new (winston.transports.DailyRotateFile)({
            filename: path.join(logDir, '%DATE%-Error.log'),
            timestamp: now,
            datePattern: 'MM-DD-YYYY',
            prepend: true,
            json: false,
            level: 'error'
        }),

        new(winstonMail.Mail)({
            to: "recipient_email@company.com",
            from: '"Automated Error Message" <error_email@company.com>',
            subject: 'Error Detected in an API Processes',
            level: 'error',
            host: 'smtp.host.com',
            timeout:10000,
            port: 587,
            ssl: false,
            tls: true,
            username: process.env.COMPANY_EMAIL_USERNAME,
            password: process.env.COMPANY_EMAIL_PASSWORD,
        }),

        new winston.transports.Console({format: winston.format.simple() })  // can change this to winston.format.json() to show error differently.
    ],
    exitOnError: false
});

//Set up Stream if Needed
const stream = {
    write: function(message) {
        logger.info(message);
    }
};


//Export for Use As Imported Package
export default logger;
export {stream};