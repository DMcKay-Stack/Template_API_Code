//REQUIRED PACKAGES
import logger from "./Error_Logger_Template.mjs";
import fetch from "node-fetch";


//Required Functions
function delay(n) {
    return new Promise(function (resolve){
        setTimeout(resolve, n*1000);
    });
};


//Set Global Variables
let error_counter = 0;
const url = "enter the url here for the API endpoint";


async function api_call(json_body, report_name)  {
  
    let api_check = 0;

    while ( api_check === 0 ) {
        try {
            const response = await fetch(url, {
                method: "POST", //or GET depending on how the API is set up
                body: json_body,
                headers: {
                    "content-type": "application/json;charset=utf-8",
                },
            });

            if (response.status != 200) {
                error_counter++;
                logger.info("\n\n\nError in API Call for " + report_name + 
                            "\n\nResponse:     STATUS CODE: " + response.status + 
                            "\nSTATUS DESCRIPTION: " + response.statustext + 
                            "\n\nJSON Body: \n\t" + json_body + 
                            '\n\n\Pausing for delay(100) then Re-running');

                let pause = await delay(100);
                api_check = 0;
                logger.info("Re-establishing API Endpoint connection and Re-running previous API call for " + json_body);
            
                if (error_counter === 2) {
                    console.log(response);
                    logger.error("API Process Terminated. \nSTATUS CODE: " + response.status + 
                                "\nSTATUS DESCRIPTION: " + response.statustext + 
                                "\n\n  JSON Body: " + json_body);
                    return;
                };

            } else if (response.status == 503) { 
                logger.error("503 Error in API Call for " + report_name + 
                            "\n\nResponse:     STATUS CODE: " + response.status + 
                            "\nSTATUS DESCRIPTION: " + response.statustext + 
                            "\n\nJSON Body: \n\t" + json_body);
                return;

            } else {
                api_check = 1;
                const result = await response.json();
                return result;
            };

        } catch (err) {
            logger.error("THERE WAS AN ERROR IN THE API CALL: " + err.stack + '\n' + json_body);
        };  
    };
    error_counter=0;
};

export default api_call;