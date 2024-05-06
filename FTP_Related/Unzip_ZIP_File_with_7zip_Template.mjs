//Required Packages
import dotenv from 'dotenv'
dotenv.config({ path: "../.env" });
import { exec } from 'child_process';


//JS Code
import logger from "../Email_Related/Error_Logger_Template.mjs";
/*Must Also Have Downloaded 7-Zip to Machine Utilizing this Code*/


///////////////////////////////////////////////////////////////////
////////////          UNZIPS FILE USING 7-ZIP          ////////////
///////////////////////////////////////////////////////////////////


//Set Variables
const filePath = path.join('/folder','filename');
const decryptPass = process.env.DECRYPTION_PASSWORD;
const newFilePath = path.join('/new_folder','filename');


//Call Function
async function Unzip_File_with_7zip() {
    try {

        return new Promise( (resolve, reject) => {
            //require('child_process').exec;
            var cmd = 'sudo 7z x ' + filePath + ' -p"' + decryptPass + '" -y -o"' + outputPath + '"';

            exec(cmd, function (err){
                if (err){
                    reject(err);
                } else {
                    resolve(newFilePath);
                };
            });
        });

    } catch (err) {
        logger.error("There was an error unzipping the file: \n" + (err.stack || err));
    };  

};

export default Unzip_File_with_7zip;