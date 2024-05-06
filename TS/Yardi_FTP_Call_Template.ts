//Required Packages
require dotenv from 'dotenv'
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
function delay(n: number): Promise<void> {
    return new Promise(function (resolve){
      setTimeout(resolve, n*1000);
    });
  };
  

//SET DATES
const now: Date = new Date();
const date: string = dateFormat(now, "isoDate");


//SET GLOBAL VARIABLES
let sftp: Client = new Client();
let remoteDir: string = '/ClientFTP';
let archiveDir: string = '/InternalFTP/Archive';
let folder: string = './Client_Files/';
let lockdir: string = '/src/tempLock/FTP_CALL.lock';

const config: { host: string; username: string; password: string } = {  
    host: 'company.sharetru.com',
    username: 'username',
    password: 'password'
};

let options: { readStreamOptions: { autoClose: boolean } } = {
    readStreamOptions: {
      autoClose: true
}};


//CALL FUNCTION
async function FTP_sftp(): Promise<void> {
    try {
        let array: string[] = [];
        let filename: string;
        let closeConnection: boolean; 

    //connect to sftp
        let createConnection: Client = await sftp.connect(config);
        console.log('FTP Connection Established');

    //list available files for download
        let availableFiles: { name: string }[] = await sftp.list(remoteDir);


    //iterate through available files and download any new ones        
        for (let i=0; i < availableFiles.length; i++) {
            
            filename = availableFiles[i].name;

            array.push(filename);
        };
        console.log(array);

        for (let p = 0; p < array.length; p++) {

            console.log('\n\n\nRecord ', p);

            let remoteFile: string = path.join(remoteDir, array[p]);
            console.log(remoteFile);


    //set up destination       
            let destination: fs.WriteStream = fs.createWriteStream(path.join('/src/FTP/Client_Files', array[p]));
            let fileToArchive: string = `/src/FTP/CLient_Files/${array[p]}`;
            console.log('\n\nFile to Archive:   ' + fileToArchive);

    //copy file to destination          
            const result: void = await sftp.get(remoteFile, destination); 

    //Archive Original File and Remove from Folder
           let archiveFile: string = path.join(archiveDir, array[p]);

            const archive: void = await sftp.fastPut(fileToArchive, archiveFile);
            const deleteOriginal: void = await sftp.delete(remoteFile);

        // Process the files
     
            if (array[p].includes('ResUnpaidCharges')) {
                const sqlSave = await ResUnpaidCharges_CSV_to_json(array[p], folder);
            } else if (array[p].includes('ResUnitTypes')) {
                const sqlSave = await ResUnitTypes_CSV_to_json(array[p], folder);
            } else if (array[p].includes('ResTenants') || array[p].includes('SeniorResidents')) {
                const sqlSave = await ResTenants_CSV_to_json(array[p], folder);
            } else if (array[p].includes('ResUnitTypeDetails')) {
                const sqlSave = await ResUnitTypeDetails_CSV_to_json(array[p], folder);
            } else if (array[p].includes('ResManageRentableItems')) {
                const sqlSave = await ResManageRentableItems_CSV_to_json(array[p], folder);
            } else if (array[p].includes('ResLeaseCharges') || array[p].includes('SeniorRecurringCharge')) {
                const sqlSave = await ResLeaseCharges_CSV_to_json(array[p], folder);
            } else if (array[p].includes('FinCharges')) {
                const sqlSave = await FinCharges_CSV_to_json(array[p], folder);
            } else if (array[p].includes('FinDeposits')) {
                const sqlSave = await FinDeposits_CSV_to_json(array[p], folder);
            } else if (array[p].includes('FinPrePayments')) {
                const sqlSave = await FinPrePayments_CSV_to_json(array[p], folder);
            } else if (array[p].includes('MaintWorkOrders')) {
                const sqlSave = await MaintWorkOrders_CSV_to_json(array[p], folder);
            } else if (array[p].includes('ResProspects') || array[p].includes('SeniorProspects')) {
                const sqlSave = await ResProspects_CSV_to_json(array[p], folder);
            } else if (array[p].includes('ResRoommate')) {
                const sqlSave = await ResRoommates_CSV_to_json(array[p], folder);
            } else if (array[p].includes('FinJournals')) {
                const sqlSave = await FinJournals_CSV_to_json(array[p], folder);
            } else if (array[p].includes('ResTenantHistory')) {
                const sqlSave = await ResTenantHistory_CSV_to_json(array[p], folder);
            } else if (array[p].includes('UnitStatus')) {
                const sqlSave = await UnitStatus_CSV_to_json(array[p], folder);
            } else {
                logger.error('This report was not processed: ' + array[p]);
            }

            // Pause before trying to process the next CSV
            console.log('pause');
            const pause = await delay(10);
        }

        // If the tempLock directory exists, delete it and close the connection
        if (fs.existsSync(lockdir)) {
            fs.rmdir(lockdir);
            closeConnection = await sftp.end();
        } else {
            console.log('No Lock File Found');
            closeConnection = await sftp.end();
        }
    } catch (err) {
        // If the tempLock directory exists, delete it and log the error
        if (fs.existsSync(lockdir)) {
            fs.rmdir(lockdir);
            logger.error("There was an error in the FTP Connection\n" + (err.stack || err));
        } else {
            console.log('No Lock File Found');
            logger.error("There was an error in the FTP Connection\n" + (err.stack || err));
        }
    }
}

FTP_sftp();