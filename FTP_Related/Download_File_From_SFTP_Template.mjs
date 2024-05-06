//Required Packages
import dotenv from 'dotenv'
dotenv.config({ path: "../.env" })
import Client from 'ssh2-sftp-client';
import dateFormat from "dateformat";
import fs from "fs-extra";
import buffer from "buffer";
import path from 'path';
import through from 'through2';


//JS Code
import logger from "../Email_Related/Error_Logger_Template.mjs";


/////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////          LOCATES FILE ON SFTP AND DOWNLOADS IT TO DESIGNATED DIRECTORY          ////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////


// Set Date
var now = new Date();


//Set Variables
let sftp = new Client();
let remoteDir = 'Enter SFTP Directory Path Here';
let destinationDir = 'Enter Destination Folder Path Here';
let destinationFilename = 'Enter Destination Filename Here';
let remoteFilename = 'Enter Remote Filename Here';


//Configure SFTP Connection Components
const config = {  
    host: process.env.SFTP_SERVER, // IP Address
    username: process.env.SFTP_SERVER_USERNAME,
    password: process.env.SFTP_SERVER_PASSWORD
};


//Call Function
async function sftp_file_download() {
    try {
    
    // Connect to SFTP
        let createConnection = await sftp.connect(config);
        console.log('SFTP Connection Established');

    // List Available Files for Download
        let availableFiles = await sftp.list(remoteDir);
        console.log(availableFiles);

    // List File Directory
        let remoteFile = path.join(remoteDir, remoteFilename);
        console.log(remoteFile);
    
    // Set Up Destination       
        let destination = fs.createWriteStream(path.join(destinationDir, destinationFilename));
        console.log(destination.path);

    // Log Start Time of Download
        var now = new Date();
        const starttime = dateFormat(now);
        console.log('\nStart time of download -- ' + starttime);

    // Download File from SFTP to Destination 
        const result = await sftp.get(remoteFile, destination); 

    // Log End Time of Download
        var now2 = new Date();
        const endtime = dateFormat(now2);
        console.log('\nEnd time of download -- ' + endtime);

    // Close SFTP Connection
        let closeConnection = await sftp.end();
        console.log("SFTP Connection Closed");

    // Log Time SFTP Connection Ended
        var now3 = new Date();
        const connectionClosed = dateFormat(now3);
        console.log('\nSFTP Connection Closed -- ' + connectionClosed);

    } catch(err) {
        logger.error("There was an error in the SFTP Connection Download:\n" + (err.stack || err));
    };
};


//sftp_file_download();
export default sftp_file_download;