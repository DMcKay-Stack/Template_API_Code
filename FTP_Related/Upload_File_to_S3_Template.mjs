//Required Packages
import dotenv from 'dotenv'
dotenv.config({ path: "../.env" });
import dateFormat from "dateformat";
import fs from "fs-extra";
import buffer from "buffer";
import path from 'path';
import AWS from 'aws-sdk';


//JS Code
import logger from "../Email_Related/Error_Logger_Template.mjs";


//Set variables
const fileStream = fs.createReadStream(path.join('/folder','file/filename'));


//Set Configuration
/* IMPORTANT COMMENT------ AWS IAM user needs programmatic access with permissions for AWSCloudFormationFullAccess and AmazonS3FullAccess in order for this to work properly */

const s3 = new AWS.S3({
    bucket: 'bucket-s3',            // Name of the S3 Bucket uploading file to
    accessKeyId: process.env.AWS_ACCESS_KEY_ID, 
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY, 
    region: 'name of region'        // Example: 'us-east-2'
});

const params = {
    Bucket: 'bucket-s3',            // Name of the S3 Bucket uploading file to
    Key: 'folder/filename',         // File name you want to save as in S3
    Body: fileStream
};
console.log(params.Body.path);



//Call Function 
async function Upload_File_to_S3_Bucket() {
    try {
    //Set Date
        console.log("Starting Upload to S3");
        var now = new Date();

    //Log Start time of Upload
        const starttime = dateFormat(now);
        console.log('\n\nStart time of upload -- ' + starttime);

    //Upload File to S3 Bucket
        const stored = await s3.upload(params).promise();
        console.log(stored);

    //Reset Date
        var now2 = new Date();

    //Log End Time of Upload
        const endtime = dateFormat(now2);
        console.log('\n\nEnd time of upload -- ' + endtime);


    } catch(err){
        logger.error("There was an error Uploading File to S3: \n" + (err.stack || err));
    };

};
  
export default Upload_File_to_S3_Bucket; 

