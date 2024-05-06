//Required Packages
import dotenv from 'dotenv'
dotenv.config({ path: "../.env" });
import fs from "fs-extra";
import buffer from "buffer";
import dateFormat from "dateformat";
import Client from 'ssh2-sftp-client';
import path from 'path';
import through from 'through2';


//JS Code
import ResUnpaidCharges_CSV_to_json from './FTP_ResUnpaidCharges_ProcessCSV.mjs';
import ResUnitTypes_CSV_to_json from './FTP_ResUnitTypes_ProcessCSV.mjs';
import ResUnitTypeDetails_CSV_to_json from './FTP_ResUnitTypeDetails_ProcessCSV.mjs';
import ResTenants_CSV_to_json from './FTP_ResTenants_ProcessCSV.mjs';
import ResManageRentableItems_CSV_to_json from './FTP_ResManageRentableItems_ProcessCSV.mjs';
import ResLeaseCharges_CSV_to_json from './FTP_ResLeaseCharges_ProcessCSV.mjs';
import FinCharges_CSV_to_json from './FTP_FinCharges_ProcessCSV.mjs';
import FinDeposits_CSV_to_json from './FTP_FinDeposits_ProcessCSV.mjs';
import FinPrePayments_CSV_to_json from './FTP_FinPrePayments_ProcessCSV.mjs';
import MaintWorkOrders_CSV_to_json from './FTP_MaintWorkOrders_ProcessCSV.mjs';
import ResProspects_CSV_to_json from './FTP_ResProspects_ProcessCSV.mjs';
import ResRoommates_CSV_to_json from './FTP_ResRoommates_ProcessCSV.mjs';
import FinJournals_CSV_to_json from './FTP_FinJournals_ProcessCSV.mjs';
import ResTenantHistory_CSV_to_json from './FTP_ResTenantHistory_ProcessCSV.mjs';
import UnitStatus_CSV_to_json from './FTP_UnitStatus_ProcessCSV.mjs';
import {logger, stream} from "../Util/FTP_Error_Logger.mjs";


//REQUIRED FUNCTIONS
function delay(n) {
    return new Promise(function (resolve){
      setTimeout(resolve, n*1000);
    });
  };
  

//SET DATES
var now = new Date();
const date = dateFormat(now, "isoDate");


//SET GLOBAL VARIABLES
let sftp = new Client();
let remoteDir = '/ClientFTP';
let archiveDir = '/InternalFTP/Archive';
let folder = './Client_Files/';
let lockdir = '/src/tempLock/FTP_CALL.lock';

const config = {  
    host: 'company.sharetru.com',
    username: process.env.SHARETRU_FTP_USER,
    password: process.env.SHARETRU_FTP_PASS
};

let options = {
    readStreamOptions: {
      autoClose: true
}};


//CALL FUNCTION
async function FTP_sftp() {
    try {
        let array = [];
        let filename;
        let closeConnection; 

    //connect to sftp
        let createConnection = await sftp.connect(config);
        console.log('FTP Connection Established');

    //list available files for download
        let availableFiles = await sftp.list(remoteDir);


    //iterate through available files and download any new ones        
        for (let i=0; i < availableFiles.length; i++) {
            
            filename = availableFiles[i].name;

            array.push(filename);
        };
        console.log(array);

        for (let p = 0; p < array.length; p++) {

            console.log('\n\n\nRecord ', p);

            let remoteFile = path.join(remoteDir, array[p]);
            console.log(remoteFile);


    //set up destination       
            let destination = fs.createWriteStream(path.join('/src/FTP/Client_Files', array[p]));
            let fileToArchive = `/src/FTP/CLient_Files/${array[p]}`;
            console.log('\n\nFile to Archive:   ' + fileToArchive);

    //copy file to destination          
            const result = await sftp.get(remoteFile, destination); 

    //Archive Original File and Remove from Folder
           let archiveFile = path.join(archiveDir, array[p]);

            const archive = await sftp.fastPut(fileToArchive, archiveFile);
            const deleteOriginal = await sftp.delete(remoteFile);
            
    //send file for processing
            if (array[p].includes('ResUnpaidCharges')) {
                const sqlSave = await ResUnpaidCharges_CSV_to_json(array[p],folder);
            } else if (array[p].includes('ResUnitTypes')) {
                const sqlSave = await ResUnitTypes_CSV_to_json(array[p],folder);
            } else if (array[p].includes('ResTenants') || array[p].includes('SeniorResidents')) {
                const sqlSave = await ResTenants_CSV_to_json(array[p],folder);
            } else if (array[p].includes('ResUnitTypeDetails')) {
                const sqlSave = await ResUnitTypeDetails_CSV_to_json(array[p],folder);          
            } else if (array[p].includes('ResManageRentableItems')) {
                const sqlSave = await ResManageRentableItems_CSV_to_json(array[p],folder);
            } else if (array[p].includes('ResLeaseCharges') || array[p].includes('SeniorRecurringCharge')) {
                const sqlSave = await ResLeaseCharges_CSV_to_json(array[p],folder)
            } else if (array[p].includes('FinCharges')) {
                const sqlSave = await FinCharges_CSV_to_json(array[p],folder);
            } else if (array[p].includes('FinDeposits')) {
                const sqlSave = await FinDeposits_CSV_to_json(array[p],folder);
            } else if (array[p].includes('FinPrePayments')) {
                const sqlSave = await FinPrePayments_CSV_to_json(array[p],folder);
            } else if (array[p].includes('MaintWorkOrders')) {
                const sqlSave = await MaintWorkOrders_CSV_to_json(array[p],folder);
            } else if (array[p].includes('ResProspects') || array[p].includes('SeniorProspects')) {
                const sqlSave = await ResProspects_CSV_to_json(array[p],folder);
            } else if (array[p].includes('ResRoommate')) {
                const sqlSave = await ResRoommates_CSV_to_json(array[p],folder);
            } else if (array[p].includes('FinJournals')) {
                const sqlSave = await FinJournals_CSV_to_json(array[p],folder);
            } else if (array[p].includes('ResTenantHistory')) {
                const sqlSave = await ResTenantHistory_CSV_to_json(array[p],folder);
            } else if (array[p].includes('UnitStatus')) {
                const sqlSave = await UnitStatus_CSV_to_json(array[p],folder);
            } else {
                logger.error('This report was not processed: ' + array[p])
            };
    //Pause before trying to process next csv - keeps EC2 from crashing when processing 1million row files
            console.log('pause')
            let pause = await delay(10);
        };
    
    //If tempLock Directory Exists - Delete It , Then Close the Connection
        if (fs.existsSync(lockdir)) {
            fs.rmdir(lockdir);
            //Close Connection to FTP Site
            closeConnection = await sftp.end();
        } else { 
            console.log('No Lock File Found');
            //Close Connection to FTP Site
            closeConnection = await sftp.end();
        };


    } catch(err) {
    //If tempLock Directory Exists - Delete It
        if (fs.existsSync(lockdir)) {
            fs.rmdir(lockdir);
            logger.error("There was an error in the FTP Connection\n" + (err.stack || err));
        } else { 
            console.log('No Lock File Found');
            logger.error("There was an error in the FTP Connection\n" + (err.stack || err));
        };
    };
};

FTP_sftp();