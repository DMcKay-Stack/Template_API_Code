//REQUIRED PACKAGES
import sql from 'mssql';
import dotenv from 'dotenv'
dotenv.config({ path: "../.env" });

const config = {
    user: process.env.DB_LIVE_USERNAME,
    password: process.env.DB_LIVE_PASSWORD,
    server: process.env.DB_LIVE_HOST_URL,
    port: 1433,
    database: process.env.DB_LIVE_DATABASE,
    options: { 
        enableArithAbort: true, 
        encrypt: true,
        trustServerCertificate: true
      },
    pool: process.env.DB_POOL
  };
 

const poolConnectionLive = new sql.ConnectionPool(config);

export default poolConnectionLive;