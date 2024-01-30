import * as path from "path";
import * as dotenv from "dotenv";

// Get the current directory of the script
const currentDir = __dirname;

// Construct the path to the .env file
const envFilePath = path.resolve(currentDir, "../../../bc_obps/.env");

// Load environment variables from the .env file
dotenv.config({
  path: envFilePath,
});

// Connection to PostgreSQL DB
const { Pool } = require("pg");

export const pool = new Pool({
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
});
