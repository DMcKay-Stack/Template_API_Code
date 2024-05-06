//Required Packages
import dotenv from 'dotenv'
dotenv.config({ path: "../.env" });
import fse from "fs-extra";
import buffer from "buffer";
import dateFormat from "dateformat";
import xlsx from "xlsx";


//JS Code
import sqlStorage from './SQL_Storage_Template.mjs';
import logger from "../Email_Related/Error_Logger_Template.mjs";


//Set Dates
var now = new Date();
var date = dateFormat(now, 'isoDate');
var report_run = dateFormat(now, 'yyyy-mm-dd HH:MM:ss');          


//Set Global Variables
let global_error_counter = 10;
let excel_file_name = 'Enter the Name of the Excel File Here';
let name_of_sheet = 'Enter Name of Excel Sheet to be Processed';


//Call Function
async function Process_Excel_File_to_JSON() {
    console.log("\nReady to Convert Excel Files to JSON Objects");
    try {

//Convert Excel Spreadsheet to JSON & Save to SQL
        const wb1 = xlsx.readFile(`'${excel_file_name}'`);
        var ws1 = wb1.Sheets[`'${name_of_sheet}'`];
        var data = xlsx.utils.sheet_to_json(ws1);
        
        let sqlSave = await sqlStorage(report_run, data);
        global_error_counter = (global_error_counter - sqlSave);

        if (global_error_counter == 0) {
            logger.error("Convert Excel to JSON SQL Save Terminated. Global Error Counter Reached 10 or More Errors");
            return;
        };

        return date;

    } catch (err) {
        console.log("There was an error converting the Excel File to JSON : \n" + (err.stack || err));
    };

    global_error_counter=0;
};
    
Process_Excel_File_to_JSON();