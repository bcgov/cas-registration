// ℹ️ Environment variables
import * as dotenv from "dotenv";
dotenv.config({ path: "./e2e/.env.local" });

// Upsert an Operator record
export const upsertOperator = {
  text: `
    INSERT INTO erc.operator (id, status, legal_name, trade_name, cra_business_number, bc_corporate_registry_number, business_structure_id, is_new)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    ON CONFLICT (id)
    DO UPDATE SET status = EXCLUDED.status;
  `,
  values: [
    2,
    "Approved",
    "Existing Operator 2 Legal Name",
    "Existing Operator 2 Trade Name",
    "987654321",
    "def1234567",
    "BC Corporation",
    false,
  ],
};

// Upsert an User Operator record
export const upsertUserOperator = {
  text: `
    INSERT INTO erc.user_operator (user_id, role, status, operator_id)
    VALUES ($1,  $2, $3, $4)
    ON CONFLICT (user_id, operator_id)
    DO UPDATE SET role = EXCLUDED.role, status = EXCLUDED.status;
  `,
  values: [
    process.env.E2E_INDUSTRY_USER_ADMIN_GUID as string,
    "admin",
    "Approved",
    2,
  ],
};

// Upsert a User record
const upsertUser = `
     INSERT INTO erc.user (user_guid, app_role_id, first_name, last_name , position_title , email, phone_number, business_guid, bceid_business_name )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    ON CONFLICT (user_guid)
    DO UPDATE SET app_role_id = EXCLUDED.app_role_id
  `;
// Upsert a User record:  bc-cas-dev
export const upsertUserIOAdmin = {
  text: upsertUser,
  values: [
    process.env.E2E_INDUSTRY_USER_ADMIN_GUID as string,
    "industry_user",
    "Bcgov",
    "Cas",
    "ADMINISTRATOR",
    "email@email.com",
    "+16044015432",
    "efb76d57-88b7-4eb6-9f26-ec12b49c14c1",
    "bceid_business_name",
  ],
};

// Upsert a User record: bc-cas-dev-secondary
export const upsertUserIO = {
  text: upsertUser,
  values: [
    process.env.E2E_INDUSTRY_USER_GUID as string,
    "industry_user",
    "Cas",
    "SECONDARY",
    "USER",
    "email@email.com",
    "+16044015432",
    "efb76d57-88b7-4eb6-9f26-ec12b49c14c1",
    "bceid_business_name",
  ],
};

// Delete User record: bc-cas-dev-three
export const deleteUserNew = {
  text: "DELETE FROM erc.user WHERE user_guid = $1",
  values: [process.env.NEW_USER_GUID as string],
};
