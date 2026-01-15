import * as path from "path";
import * as dotenv from "dotenv";
import { Pool } from "pg";

// Resolve the path to the .env file
const envFilePath = path.resolve(__dirname, "../../../../../bc_obps/.env");

// Load environment variables from the .env file
dotenv.config({ path: envFilePath });

// Connection to PostgreSQL DB

export const pool = new Pool({
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  port: Number(process.env.DB_PORT),
});
