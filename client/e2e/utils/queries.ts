// 🥞 Connection pool to postgres DB
import { pool } from "@/e2e/utils/pool";
// ☰ Enums
import { UserRole } from "@/e2e/utils/enums";
// ℹ️ Environment variables
import * as dotenv from "dotenv";
dotenv.config({ path: "./e2e/.env.local" });

// Delete User record
const deleteUser = "DELETE FROM erc.user WHERE user_guid = $1";
// 🛠️ Function: deletes user based on values received
export const deleteUserRecord = async <T>(values: T[]) => {
  try {
    const query = {
      text: deleteUser,
      values: values,
    };
    // ▶️ Execute the query
    await pool.query(query);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(`Error deleting record:`, error);
    throw error;
  }
};

// Delete User Operator record
const deleteUserOperator = "DELETE FROM erc.user_operator WHERE user_id = $1";
// 🛠️ Function: deletes user operator based on values received
export const deleteUserOperatorRecord = async <T>(values: T[]) => {
  try {
    const query = {
      text: deleteUserOperator,
      values: values,
    };
    // ▶️ Execute the query
    await pool.query(query);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(`Error deleting record:`, error);
    throw error;
  }
};

// Upsert an Operator record
const upsertOperator = `
    INSERT INTO erc.operator (id, status, legal_name, trade_name, cra_business_number, bc_corporate_registry_number, business_structure_id, is_new)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    ON CONFLICT (id)
    DO UPDATE SET status = EXCLUDED.status;
  `;
// 🛠️ Function: upserts operator record based on values received
export const upsertOperatorRecord = async <T>(values: T[]) => {
  try {
    const query = {
      text: upsertOperator,
      values: values,
    };
    // ▶️ Execute the query
    await pool.query(query);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(`Error upserting operator record:`, error);
    throw error;
  }
};

// Upsert a User record
const upsertUser = `
     INSERT INTO erc.user (user_guid, app_role_id, first_name, last_name , position_title , email, phone_number, business_guid, bceid_business_name )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    ON CONFLICT (user_guid)
    DO UPDATE SET app_role_id = EXCLUDED.app_role_id;
  `;
// industry_user
const upsertUserIOValues = [
  process.env.E2E_INDUSTRY_USER_GUID as string,
  "industry_user",
  "Cas",
  "SECONDARY",
  "USER",
  "email@email.com",
  "+16044015432",
  "efb76d57-88b7-4eb6-9f26-ec12b49c14c1",
  "bceid_business_name",
];
// industry_user_admin
const upsertUserIOAdminValues = [
  process.env.E2E_INDUSTRY_USER_ADMIN_GUID as string,
  "industry_user",
  "Bcgov",
  "Cas",
  "ADMINISTRATOR",
  "email@email.com",
  "+16044015432",
  "efb76d57-88b7-4eb6-9f26-ec12b49c14c1",
  "bceid_business_name",
];
// 🛠️ Function: upserts user record based on user role received
export const upsertUserRecord = async (userRole: string) => {
  try {
    let values: (string | number | boolean)[] = [];
    switch (userRole) {
      case UserRole.INDUSTRY_USER:
        values = upsertUserIOValues;
        break;
      case UserRole.INDUSTRY_USER_ADMIN:
        values = upsertUserIOAdminValues;
        break;
    }
    const query = {
      text: upsertUser,
      values: values,
    };
    // ▶️ Execute the query
    await pool.query(query);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(`Error upserting user ${userRole} record:`, error);
    throw error;
  }
};

// Upsert a User Operator record
const upsertUserOperator = `
    INSERT INTO erc.user_operator (user_id, role, status, operator_id)
    VALUES ($1,  $2, $3, $4)
    ON CONFLICT (user_id, operator_id)
    DO UPDATE SET role = EXCLUDED.role, status = EXCLUDED.status;
  `;
// 🛠️ Function: upserts user operator record based on values received
export const upsertUserOperatorRecord = async <T>(values: T[]) => {
  try {
    const query = {
      text: upsertUserOperator,
      values: values,
    };
    // ▶️ Execute the query
    await pool.query(query);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(`Error upserting user operator record:`, error);
    throw error;
  }
};
