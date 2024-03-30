//Required Packages
import dotenv from 'dotenv'
dotenv.config({ path: "../.env" });
import dateFormat from "dateformat";


//JS Code
import query1 from './SQL Query_Template.mjs';
import query2 from './SQL_Query_Template_2.mjs';                    // 'Save As' the SQL_Query_Template.mjs and rename
import query3 from './SQL_Query_Template_3.mjs';                    // 'Save As' the SQL_Query_Template.mjs and rename
import mailer_call from './mailer_template.mjs';        
import jsonStorage from './JSON_Storage_Mailer_Template.mjs';
//import post_api_call_simple from './API_Post_Call.mjs'            // Use to sent concatenated JSON file to API Endpoint. Comment out 'TO SEND JSON FILE VIA EMAIL' section
import logger from './Error_Logger_Template.mjs';


//Required Functions
function delay(n) {
    return new Promise(function (resolve){
        setTimeout(resolve, n*1000);
    });
};


//Set Date
var now = new Date();
const as_of_date = dateFormat(now, "isoDate");


// Call Function 
async function json_build() {
    console.log("Building Combined JSON for 3 SQL Queries");
    try { 
   
    //Pull Sql Query Results (already return as a JSON Object)
        const result_1 = await query1;                              // 1st sql query
        const result_2 = await query2;                              // 2nd sql query
        const result_3 = await query3;                              // 3rd sql query


        console.log('Result 1 = ', result_1.length);
        console.log('Result 2 = ', result_2.length);
        console.log('Result 3 = ', result_3.length);


    //Concatentate result_1 and result_2 into 1 file    
        let result_set_1 = result_1.concat(result_2);
        let short_pause = delay(3);                                 // Delay the next step in case the first 2 results are very large

    //Concatenate result_set_1 with result_3
        let complete_new_set = result_set_1.concat(result_3);

        console.log('Combined List Length = ', complete_new_set.length);

    
// ---------------- TO SEND JSON FILE VIA EMAIL ---------------- //  
        let date = as_of_date;
        let fileContent = JSON.stringify(complete_new_set);
        let fileName = 'Enter New Filename Here';

    //save file as .json format
        let jsonSave = await jsonStorage(date, fileContent, fileName);

    //Isolate the .json directory. This are needed to attach the file to the email sent my mailer.mjs
        let dir = jsonSave.filedirectory;

    //Call mailer.mjs function
        await mailer_call.isExport(dir);



// ---------------- TO SEND JSON FILE VIA POST API CALL ---------------- //

        //let sendJSON = await post_api_call_simple(complete_new_set);


//End Function        
        return as_of_date;
        

    } catch(err){
        logger.error(`There was an error in the Build_JSON_to_Email_as_Attachment.mjs: ` + (err.stack || err));
    };
};


json_build();