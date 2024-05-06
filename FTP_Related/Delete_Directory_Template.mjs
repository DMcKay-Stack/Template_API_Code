//Required Packages
import dotenv from 'dotenv'
dotenv.config({ path: "../.env" });
import fs from "fs-extra";
import buffer from "buffer";
import path from 'path';
import { exec } from 'child_process';


//JS Code
import logger from "../Email_Related/Error_Logger_Template.mjs";


//Set Variables
const outputPath = path.join('/path_to','directory') 
var cmd = 'sudo rmdir ' + outputPath;    //Command used to remove directory in Linux  -->  sudo rmdir '/path/to/directory'


//Call Function
async function delete_directory() {
    try {
        
        return new Promise( (resolve, reject) => {

    //Execute the Command to Delete the File
            exec(cmd, function (err){
                if (err){
                    reject(err);
                } else {
                    resolve(outputPath);
                };
            });
        });

    } catch (err) {
        logger.error("There was an error deleting the directory: \n" + (err.stack || err));
    };

};

export default delete_directory;
