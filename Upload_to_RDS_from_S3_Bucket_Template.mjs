//Required Packages
import dotenv from 'dotenv'
dotenv.config({ path: "../.env" });
import dateFormat from 'dateformat';
import buffer from 'buffer';
import sql from 'mssql';


//JS Code
import poolConnectionLive from './production_database_Template.mjs';
import poolConnectionTest from './test_database_Template.mjs';
import logger from "./Error_Logger_Template.mjs";


//////////////////////////////////////////////////////////////////////////////////
////////////          RESTORES AWS HOSTED RDS FROM S3 BUCKET          ////////////
//////////////////////////////////////////////////////////////////////////////////


//Required Functions
function delay(n) {
    return new Promise(function (resolve){
        setTimeout(resolve, n*1000);
    })
};


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
} 
else if (environment == 'Development') {
    db1 = poolConnectionTest;             //pool1 = new sql.ConnectionPool(config)
    db1Connect = db1.connect();           //pool1Connect = pool1.connect()
    db1.on('error', err => {
        logger.error((err.stack || err))
    });
};


//Call Function
async function SQL_RDS_Restore_From_S3() { 

// 1 -- Set Variables
    let name_of_database = 'Enter Name of Database to be Restored';
    let S3_bucket = 'Enter S3 bucket arn address'; //Example: 'arn:aws:s3:::bucketname-s3/folder/filename'

// 2 - Set Processes to be Executed    
    let checkForDatabase = `DECLARE @dbname sysname SET @dbname = N'${name_of_database}'    
                           IF DB_ID(@dbname) IS NOT NULL BEGIN
                           EXECUTE msdb.dbo.rds_drop_database N'${name_of_database}' END`;
         
                  
   
    let uploadNewDatabase = `exec msdb.dbo.rds_restore_database 
                            @restore_db_name= '${name_of_database}', 
                            @s3_arn_to_restore_from='${S3_bucket}'`;


    let trackprogress = `SELECT session_id as SPID, command, a.text AS Query, start_time, percent_complete, 
                        dateadd(second,estimated_completion_time/1000, getdate()) as estimated_completion_time 
                        FROM sys.dm_exec_requests r CROSS APPLY sys.dm_exec_sql_text(r.sql_handle) a 
                        WHERE r.command in ('BACKUP DATABASE','RESTORE DATABASE') `;

// 3 - Connect to Database and Run Above Processes
    await db1Connect;                                   
    try {
        const request = db1.request();

    //Check for Database Existence, Drop If Exists
        const result = await request.query(checkForDatabase);
        console.log(result);
    
    //Initiate Pause 
        console.log("Pausing");
        let pause = await delay(60);

    //Initate Creation of New Database and Restore from S3 Backup
        console.log("Pause Complete. Starting DB Restore");
        const upload = await request.query(uploadNewDatabase);   
        console.log(upload);  
        console.log(upload.recordsets);

    //Track the Progress of Restore
        const progress1 = await request.query(trackprogress);      
        console.log(progress1);

    //Initiate Second Pause
        let pause2 = await delay(60);

    //Track the Progress of Restore
        const progress2 = await request.query(trackprogress);      
        console.log(progress2);
    
    //Initiate Third Pause
        let pause3 = await delay(60);
        
    } catch (err) {
        logger.error('Error Restoring Database to SQL RDS\n\n' + (err||err.stack));
    };
};

//SQL_RDS_Restore_From_S3();
export default SQL_RDS_Restore_From_S3;