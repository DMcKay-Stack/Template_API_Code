//REQUIRED PACKAGES
import sql from 'mssql';
import dotenv from 'dotenv'
dotenv.config({ path: "../.env" });

const config = {
    user: process.env.DB_TEST_USERNAME,
    password: process.env.DB_TEST_PASSWORD,
    server: process.env.DB_TEST_HOST_URL,
    port: 1433,
    database: process.env.DB_TEST_DATABASE,
    options: { 
        enableArithAbort: true, 
        encrypt: true},
    pool: process.env.DB_POOL
  };
 

const poolConnectionTest = new sql.ConnectionPool(config);

export default poolConnectionTest;