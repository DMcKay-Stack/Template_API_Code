//Required Packages
import dateFormat from "dateformat";
import fs from "fs-extra";
import buffer from "buffer";


//JS Code
import queryArray from "./SQL_Query_Template.mjs";
import api_call from "./API_Call_NodeFetch_Template.mjs";
import sqlStorage from "./N_Day_Refresh_SQL_Storage_Template.mjs";
import sqlDeleteRows from "./SQL_Delete_Template.mjs";
import jsonStorage from "./JSON_Storage_Template.mjs";
import logger from "./Error_Logger_Template.mjs";


//Required Functions
function delay(n) {
    return new Promise(function (resolve){
        setTimeout(resolve, n*1000);
    });
};


// Set Date
var now = new Date();
const today = dateFormat(now, "isoDate");
console.log('Todays Date is:  ' + today);


// Set Variables
let global_error_counter = 10;
let directory = /*enter directory name here --> */ '';
let lockdir = `/src/temporaryLockDirectory/${directory}.lock`;
let n = 30; //Number of Days to run the report for


// Call Function
async function Refresh_N_Days() {
    console.log(`Reached ${n} Day Refresh`);
    try {
        
    // Set Local Variables    
        let id = [];
        
        
    // Set Start Date    
        const obtain_start_date = dateFormat(now.setDate(now.getDate() - n), "isoDate"); 
        console.log(obtain_start_date);  // Example: 2023-02-04
    
    // Set First Day to Run Report For
        var start_date = new Date(obtain_start_date);
        console.log(start_date);
     
    // Running for n days
        for (let d = 0; d < n; d++) {
            console.log("Current Date Incrementer: " + d);
    
        //Current Date Code Running For
            var date = dateFormat(start_date.setDate(start_date.getDate() + 1), "isoDate");
           
        //Compile List of IDs from SQL Query ("./sql_query_code.mjs")
            const list = await queryArray;              

        // Iterate through IDs pulled from SQL Query and Push them to an Array
            for (let i = 0; i < list.length; i++) {     
               id.push(list[i].sql_list_id);    
            }; 
   

// 2 - Build API Body

            let body_call = {
                "Data": `Enter_JSON_Object_for_API_Body_Pprtion_of_Call`,
                "Include_ID_Array": id.join()
            };
            
            const json_body = JSON.stringify(body_call);

// 3 - Call API  and pass JSON
            let result = await api_call(json_body,`${n}_Day_Refresh_Template.mjs`);  //Returns JSON OBJECT as the result of API Call

// 4  - Process API Result
            if (global_error_counter <= 0) {
                logger.error(`${n} Day Refresh Terminated due to 10 global errors.`)
                return;
            } else {
                if (result.response.error) {
                    global_error_counter--;
                    logger.error(`${n} Day Refresh API Call Reports Error: \nError Message (API Report Issue): ` + result.response.error.message);
    
                } else if (result.response.result[0] == undefined) {
                    logger.info(`${n} Day Refresh - No Records Found`);
    
                } else {
                    const API_Result = result.response.result[0].reportData;

// 5 - Save File to JSON
                    let fileContent = JSON.stringify(API_Result);
                    let jsonSave = await jsonStorage(date, 1/*or id*/, fileContent, api_call_name);

// 6 - SQL Database Update

                //Delete Rows for Date (Only If Necessary)
                    let rowsDeletedFromTable = await sqlDeleteRows(date);

                //  Save New Rows to Data Table
                    let sqlSave = await sqlStorage(API_Result, date);

                // Subtract Any Errors from SQL Storage and Code will Keep Going or Terminate
                    global_error_counter = (global_error_counter - sqlSave);    
                    if (global_error_counter == 0) {
                        logger.error(`${n} Day Refresh Terminated due to Global Error Counter reaching 10 errors after SqlSave`);
                        return;
                    };
                };
            };
        };

    // Terminate if Global Error Counter is at 0
        if (global_error_counter == 0) {
            logger.error(`${n} Day Refresh Terminated due to Global Error Counter reaching 10 errors`);
            return;
        };

    // Delete Lock File  
        if (fs.existsSync(lockdir)) {
            fs.rmdir(lockdir);
            console.log('Lock File Successfully Deleted');
            global_error_counter = 0;
            return;
        } else { 
            console.log('No Lock File Found');
            global_error_counter = 0;
            return;
        };

    } catch(err) {

    // Delete Lock File so the system can try again after receiving the error.   
        if (fs.existsSync(lockdir)) {
            fs.rmdir(lockdir); 
            logger.error(`Lock File Deleted. There was an error in the ${n} Day Refresh: ` + (err.stack || err));
            global_error_counter = 0;
            return;

        } else {
            logger.error(`No Lock File Found. There was an error in the ${n} Day Refresh: ` + (err.stack || err));
            global_error_counter = 0;
            return;
        };
    };
};

Refresh_N_Days();