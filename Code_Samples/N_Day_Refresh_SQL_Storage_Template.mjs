//Required Packages
import dateFormat from 'dateformat';
/*import buffer from 'buffer';*/        //This may or may not be needed depending what version of Nodejs you're using


//JS Code
import poolConnectionLive from '../SQL_Related/production_database_Template.mjs';
import poolConnectionTest from '../SQL_Related/test_database_Template.mjs';
import logger from "../Email_Related/Error_Logger_Template.mjs";


//Set Date
var now = new Date();
var report_run = dateFormat(now, 'yyyy-mm-dd HH:MM:ss:l');         //2020-01-01 05:01:50.097    


// Database Connection
const environment = 'Production';
let db1Connect;
let db1;

if (environment == 'Production') {
    db1 = poolConnectionLive;             //pool1 = new sql.ConnectionPool(config)
    db1Connect = db1.connect();           //pool1Connect = pool1.connect()
    db1.on('error', err => {
        logger.error((err.stack || err))
    });
    console.log("Writing to database from N_Day_Refresh_SQL_Storage_Template.mjs");
} 
else if (environment == 'Development') {
    db1 = poolConnectionTest;             //pool1 = new sql.ConnectionPool(config)
    db1Connect = db1.connect();           //pool1Connect = pool1.connect()
    db1.on('error', err => {
        logger.error((err.stack || err))
    });
    console.log("Writing to test_database from N_Day_Refresh_SQL_Storage_Template.mjs");
}


//Set Global Variables
let global_count = 0;
let skipped = 0;
let recordsCreated = 0;


//Call Function
async function sqlStorage(API_Result, date) { 

    for (let i = 0; i < API_Result.length ; i++) {  

        if (API_Result[i].status.includes('A') || API_Result[i].status.includes('B') || API_Result[i].status.includes('C')) {
            console.log(API_Result[i].status);
            skipped ++;
            continue;

        } else {
            //console.log(API_Result[i]);
            let api_values = {
                'date': "'" + date + "'",
                'id': API_Result[i].id,
                'name': "'" + API_Result[i].name.replace(/'/g,"\''") + "'",
                'type': API_Result[i].type == undefined ? null : "'" + API_Result[i].type.replace(/'/g,"\''") + "'",
                'address': API_Result[i].physical_address == null ? null :  "'" + API_Result[i].physical_address.replace(/'/g,"\''") + "'",
                'city': API_Result[i].city == null || '' ? null : "'" + API_Result[i].city.replace(/'/g,"\''") + "'",
                'state': API_Result[i].state == null || '' ? null : "'" + API_Result[i].state + "'",
                'zip': API_Result[i].zip == null || '' ? null : API_Result[i].zip,
                'country': API_Result[i].country  == null ? null : "'" + API_Result[i].country + "'",
                'email_address': API_Result[i].email_address == null ? null : "'" + API_Result[i].email_address.replace(/'/g,"\''") + "'",
                'phone_number':API_Result[i].phone_number == null ? null: "'" + API_Result[i].phone_number.replace(/\(|\)/g, "") + "'",
                'notes': "'" + API_Result[i].notes.replace(/'/g,"\''") + "'",
                'boolean_field': "'" + Boolean(API_Result[i].true_or_false) + "'",
                'specific_date': API_Result[i].specific_date == null ? null : "'" + dateFormat(API_Result[i].specific_date, "yyyy-mm-dd") + "'",
                'other_integer': API_Result[i].other_integer, //could also be a decimal
                'report_run': "'" + report_run + "'"


              
            };
            console.log(api_values);

            let sqlInsert = `INSERT INTO database.dbo.table (date, id, name, type, address, city, state, zip, country, email_address, phone_number, notes,
                             boolean_field, specific_date, other_integer, report_run) VALUES (` + api_values.date + ', ' + api_values.id + ', ' +  api_values.name + ', ' +  
                             api_values.type + ', ' + api_values.address + ', ' + api_values.city + ', ' + api_values.state + ', ' + api_values.zip + ', ' + 
                             api_values.country + ', ' + api_values.email_address + ', ' + api_values.phone_number + ', ' + api_values.notes + ', ' + 
                             api_values.boolean_field + ', ' + api_values.specific_date + ', ' + api_values.other_integer + ', ' + api_values.report_run + ')'; 


            let count = 1;
            let maxTries = 3;
            let dbSuccess = 0; 

            while(count <= maxTries && dbSuccess == 0 && global_count < 10) {
               
                await db1Connect;                                   
                try {
                    const request = db1.request();
                    const result = await request.query(sqlInsert);
                    result ? dbSuccess = 1 : dbSuccess = 0;
                    recordsCreated++;

                } catch (err) {

                    if (count < maxTries) {
                        global_count++;
                            logger.info('\n\n try count = ' + count);
                            count++;
                            logger.info('30 Day Refresh SQL Storage Error' + 
                                        "\n\n ERROR OCCURRED IN: " + sqlInsert + "\n\n ERROR STACK: " + (err.stack || err));

                    } else if (count == maxTries) {
                        global_count++
                        logger.error('\n\n 30 Day Refresh SQL Error. Tried to Connect After Timeout Count = ' + count +  
                                    "\n\n ERROR STACK: " + (err.stack || err));
                        count ++;
                    };
                };
            };
        };
    };

    console.log("30 Day Refresh SQL Records Created: ", recordsCreated); 
    console.log("30 Day Refresh Records Skipped due to incorrect status", skipped);
    recordsCreated = 0;
    skipped = 0;
    return global_count;
};
global_count = 0;

export default sqlStorage;