//Required Packages
import dotenv from 'dotenv'
dotenv.config({ path: "../.env" });
import fs from "fs-extra";
import os from "os";


//Set Global Variables
const path_to_env_file = 'Enter File Path to .env File Here';


//Call Function
async function setEnvValue(refresh_token) {

    // Read File From HDD & Split It From a Linebreak to an Array
    const ENV_VARS = fs.readFileSync(path_to_env_file, "utf8").split(os.EOL);

    // Find the Variable Based on the Key
    const target = ENV_VARS.indexOf(ENV_VARS.find((line) => {
        console.log(line.match(new RegExp(process.env.SHAREPOINT_REFRESH_TOKEN)))
        return line.match(new RegExp(process.env.SHAREPOINT_REFRESH_TOKEN));
    }));

    // Replace Existing Refresh Token with New Refresh Token Value
    ENV_VARS.splice(target, 1, `SHAREPOINT_REFRESH_TOKEN=${refresh_token}`);

    // Write Updates to the .env File
    fs.writeFileSync("../.env", ENV_VARS.join(os.EOL));

};

export default setEnvValue;