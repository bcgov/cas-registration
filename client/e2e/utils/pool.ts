import * as dotenv from "dotenv";
dotenv.config({
  path: "./e2e/.env.local",
});
// connection to postgres DB
const { Pool } = require("pg");
export const pool = new Pool({
  user: process.env.DB_USER,
  password: process.env.DB_USER_PASSWORD,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
});
