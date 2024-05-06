//Required Packages
import dotenv from 'dotenv'
dotenv.config({ path: "../.env" });
import fs from "fs-extra";
import buffer from "buffer";
import path from 'path';
import { exec } from 'child_process';


//JS Code
import logger from "../Email_Related/Error_Logger_Template.mjs";


///////////////////////////////////////////////////////////////////////////
////////////          UPDATES PERMISSIONS ON .ZIP FILE          ///////////
///////////////////////////////////////////////////////////////////////////


//Set Variables
const outputPath = path.join('/folder','filename');  //folder and filename are case sensitive
var cmd = 'sudo chmod +rwx ' + outputPath;


//Call Function
async function Update_ZIP_File_Permissions() {
    try {
            
        return new Promise( (resolve, reject) => {

    //Execute the Command to Update the Permissions
            exec(cmd, function (err){
                if (err){
                    reject(err);
                } else {
                    resolve(outputPath);
                };
            });
        });

    } catch (err) {
        logger.error("There was an error updating the permissions on the unzipped .zip file: \n" + (err.stack || err));
    };    
};

export default Update_ZIP_File_Permissions;