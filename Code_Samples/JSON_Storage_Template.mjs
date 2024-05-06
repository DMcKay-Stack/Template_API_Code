//Required Packages
import dotenv from 'dotenv'
dotenv.config({ path: "../.env" });
import dateFormat from "dateformat";
import fse from "fs-extra";
import buffer from "buffer";
import * as url from 'url';
import path from 'path';
import logger from "../Email_Related/Error_Logger_Template.mjs";


//Retrieve File Name
const __filename = url.fileURLToPath(new URL('.', import.meta.url));
const __dirname = path.dirname(__filename);
console.log(__dirname);


//Process JSON Storage
async function jsonStorage(date, id, fileContent, api_call_name) {
    
    const filename = (dateFormat(date, 'UTC:yyyymmdd')) + "_" + id + "_" + api_call_name + '.mjson';
    const content = JSON.stringify(fileContent);
    fse.writeFile((__dirname + '/JSON_Storage/' + filename), content, (err) => {
        if (err) {
            logger.error("Error Storing File as JSON: " + (err.stack || err));
        } else {
            console.log("File successfully Saved");
        };
    });
};

export default jsonStorage;