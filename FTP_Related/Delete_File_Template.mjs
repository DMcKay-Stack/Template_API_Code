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
const outputPath = path.join('/folder/directory','Filename');
var cmd = 'sudo rm ' + outputPath;   //Command used for Linux  -->  sudo rm '/path/to/file'


//Call Function
async function delete_file() {
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
        logger.error("There was an error deleting file: \n" + (err.stack || err));
    };

};

export default delete_file;