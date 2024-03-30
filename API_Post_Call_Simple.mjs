//REQUIRED PACKAGES
import dotenv from 'dotenv'
dotenv.config({ path: "../.env" });
import https from 'https';
import axios from 'axios';


//JS Code
import logger from "./Error_Logger_Template.mjs";


//Required Functions
function delay(n) {
    return new Promise(function (resolve){
        setTimeout(resolve, n*1000);
    });
};
  

//Set Global Variables
let api_endpoint_url = 'https://enter_url_here_for_api_endpoint';


//Call Function
async function api_post_call_simple(json_body) {
    try { 

    //Set Up Configuration
        let config = {
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.API_TOKEN_FOR_POST_CALL}`
            }
        };
    
    //Send POST Request
        const response = await axios.post(api_endpoint_url, json_body, config);

    //Process POST Response
        const result = response.data;
        console.log(result);
        return result;

    } catch(err) {
        logger.error(`There was an error in the API_Post_Call_Simple.mjs: ` + (err.stack || err));
    };
};


//api_post_call_simple();
export default api_post_call_simple;