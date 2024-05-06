//Required Packages
import sql from 'mssql';
import poolConnectionLive from './production_database_Template.mjs'; 
import poolConnectionTest from './test_database_Template.mjs';
import logger from "../Email_Related/Error_Logger_Template.mjs"; 


///SQL Query
var sqlQuery = 'SELECT * from database.dbo.table';      // Returns JSON Object Format


// Database Connection:   
if (environment == 'Production') {
    db1 = poolConnectionLive;                           // pool1 = new sql.ConnectionPool(config)
    db1Connect = db1.connect();                         // pool1Connect = pool1.connect()
    db1.on('error', err => {
        logger.error((err.stack || err))
    });
    console.log("Connected to Production Database");

} else if (environment == 'Development') {
    db1 = poolConnectionTest;                           // pool1 = new sql.ConnectionPool(config)
    db1Connect = db1.connect();                         // pool1Connect = pool1.connect()
    db1.on('error', err => {
        logger.error((err.stack || err))
    });
    console.log("Connectd to Test Database");
};


//Set Up Function
async function queryHandler() {
    await db1Connect;                                   // pool1Connect
    try {
        const request = db1.request();                  // pool1.request()
        const result = await request.query(sqlQuery);       
           return result.recordset;
    } catch (err) {
       logger.error("Error Connecting to Database: ", (err.stack || err))
    };
    pool.close()
};

//Save Result to Variable
const queryArray = queryHandler();


export default queryArray;