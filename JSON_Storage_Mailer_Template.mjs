//Required Packages
import dotenv from 'dotenv'
dotenv.config({ path: "../.env" })
import dateFormat from "dateformat";
import fse from "fs-extra";
import buffer from "buffer";
import * as url from 'url';
import path from 'path';
import logger from "./Error_Logger_Template.mjs";

const __filename = url.fileURLToPath(new URL('.', import.meta.url));
console.log(__filename);
const __dirname = path.dirname(__filename);
console.log(__dirname);

//- SAVE TO JSON FILE

async function jsonStorage(date, fileContent, fileName) {
    
    const filename = (dateFormat(date, 'UTC:yyyymmdd')) + '_' + fileName + '.json';
    const content = JSON.stringify(fileContent);
    const filedirectory = (__dirname + '/IS_JSON_Storage/' + filename);
    fse.writeFile((__dirname + '/IS_JSON_Storage/' + filename), content, (err) => {
        if (err) {
            logger.error("Error: " + (err.stack || err));
        } else {
            logger.info("File successfully saved for " + filename);
        };
    });
    return {filename, filedirectory}
};

export default jsonStorage;