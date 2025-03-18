// 🥞 Connection pool to postgres DB
import { pool } from "@/e2e/utils/pool";
// ☰ Enums
import {
  UserRole,
  OperatorStatus,
  OperatorUUID,
  UserOperatorUUID,
} from "@/e2e/utils/enums";
// ℹ️ Environment variables
import * as dotenv from "dotenv";

dotenv.config({ path: "./e2e/.env.local" });

/***********************Operator********************************/

// Operator values type
type UpsertOperatorValues = {
  legalName: string;
  tradeName: string;
  craBusinessNumber: string;
  bcCorporateRegistryNumber: string;
  businessStructure: string;
};
// Operator default values
const defaultUpsertOperatorValues: UpsertOperatorValues = {
  legalName: "Existing Operator 2 Legal Name",
  tradeName: "Existing Operator 2 Trade Name",
  craBusinessNumber: "987654321",
  bcCorporateRegistryNumber: "def1234567",
  businessStructure: "BC Corporation",
};
// Operator Upsert SQL
const upsertOperator = `
    INSERT INTO erc.operator (legal_name, trade_name, cra_business_number, bc_corporate_registry_number, business_structure_id, status, id)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    ON CONFLICT (id)
    DO UPDATE SET status = EXCLUDED.status;
  `;
// 🛠️ Function: upserts operator record
export const upsertOperatorRecord = async (
  status: string = OperatorStatus.APPROVED,
  id: string = OperatorUUID.DEFAULT,
  values: Partial<UpsertOperatorValues> = {},
) => {
  try {
    // Merge default values with provided values
    const mergedValues: UpsertOperatorValues = {
      ...defaultUpsertOperatorValues,
      ...values,
    };

    const upsertOperatorValues = [
      mergedValues.legalName,
      mergedValues.tradeName,
      mergedValues.craBusinessNumber,
      mergedValues.bcCorporateRegistryNumber,
      mergedValues.businessStructure,
      status,
      id,
    ];

    const query = {
      text: upsertOperator,
      values: upsertOperatorValues,
    };

    // Execute the query
    await pool.query(query);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(`Error upserting operator record:`, error);
    throw error;
  }
};

/***********************User********************************/
// User User values type
type UpsertUserValues = {
  user_guid: string;
  role: string;
  first_name: string;
  last_name: string;
  position_title: string;
  email: string;
  phone_number: string;
  business_guid: string;
  bceid_business_name: string;
};

// industry_user
const upsertUserIOValues: UpsertUserValues = {
  user_guid: process.env.E2E_INDUSTRY_USER_GUID as string,
  role: "industry_user",
  first_name: "bc-cas-dev-secondary",
  last_name: "Industry User",
  position_title: "USER",
  email: "cas.secondary@email.com",
  phone_number: "+16044015431",
  business_guid: "efb76d57-88b7-4eb6-9f26-ec12b49c14c1",
  bceid_business_name: "bceid_business_name1",
};

// industry_user_admin
const upsertUserIOAdminValues: UpsertUserValues = {
  user_guid: process.env.E2E_INDUSTRY_USER_ADMIN_GUID as string,
  role: "industry_user",
  first_name: "bc-cas-dev",
  last_name: "Industry User",
  position_title: "ADMINISTRATOR",
  email: "bcgov.cas@email.com",
  phone_number: "+16044015432",
  business_guid: "efb76d57-88b7-4eb6-9f26-ec12b49c14c1",
  bceid_business_name: "bceid_business_name2",
};

const upsertUserCasValues: UpsertUserValues = {
  user_guid: process.env.E2E_CAS_USER_GUID as string,
  role: "TBD",
  first_name: "IDIR",
  last_name: "CAS USER",
  position_title: "CAS",
  email: "email@email.com",
  phone_number: "+16044015477",
  business_guid: "efb76d57-88b7-4eb6-9f26-ec12b49c14c1",
  bceid_business_name: "bceid_business_name3",
};

// Upsert a User record
const upsertUser = `
     INSERT INTO erc.user (user_guid, app_role_id, first_name, last_name , position_title , email, phone_number, business_guid, bceid_business_name )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    ON CONFLICT (user_guid)
    DO UPDATE SET app_role_id = EXCLUDED.app_role_id, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name;
  `;

// 🛠️ Function: upserts user record
export const upsertUserRecord = async (userRole: string) => {
  try {
    let values: UpsertUserValues | undefined;
    // Get values based on user role
    switch (userRole) {
      case UserRole.INDUSTRY_USER:
        values = upsertUserIOValues;
        break;
      case UserRole.INDUSTRY_USER_ADMIN:
        values = upsertUserIOAdminValues;
        break;
      case UserRole.CAS_ADMIN:
      case UserRole.CAS_ANALYST:
      case UserRole.CAS_PENDING:
        values = upsertUserCasValues;
        values.role = userRole;
        break;
    }
    if (values) {
      const query = {
        text: upsertUser,
        values: [
          values.user_guid,
          values.role,
          values.first_name,
          values.last_name,
          values.position_title,
          values.email,
          values.phone_number,
          values.business_guid,
          values.bceid_business_name,
        ],
      };
      // ▶️ Execute the query
      await pool.query(query);
    }
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(`Error upserting user ${userRole} record:`, error);
    throw error;
  }
};

// Delete User record
const deleteUserQuery = "DELETE FROM erc.user WHERE user_guid = $1";

// 🛠️ Function: deletes user based on user_guid
export const deleteUserRecord = async (userGuid: string) => {
  try {
    const query = {
      text: deleteUserQuery,
      values: [userGuid],
    };
    // Execute the query
    await pool.query(query);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(`Error deleting user record:`, error);
    throw error;
  }
};

/***********************User Operator********************************/

// User Operator values type
type UpsertUserOperatorValues = {
  id: string;
  operator_id: string;
};

// User Operator default values
const defaultUserOperatorValues: UpsertUserOperatorValues = {
  id: UserOperatorUUID.INDUSTRY_USER_ADMIN,
  operator_id: OperatorUUID.DEFAULT,
};

// Upsert a User Operator record
const upsertUserOperatorQuery = `
  INSERT INTO erc.user_operator (id, operator_id, user_id, role, status)
  VALUES ($1, $2, $3, $4, $5)
  ON CONFLICT (operator_id, user_id)
  DO UPDATE SET role = EXCLUDED.role, status = EXCLUDED.status;
`;

// 🛠️ Function: upserts user operator
export const upsertUserOperatorRecord = async (
  userId: string,
  role: string,
  status: string,
  values: Partial<UpsertUserOperatorValues> = {},
) => {
  try {
    // Merge default values with provided values
    const mergedValues: UpsertUserOperatorValues = {
      ...defaultUserOperatorValues,
      ...values,
    };

    const query = {
      text: upsertUserOperatorQuery,
      values: [mergedValues.id, mergedValues.operator_id, userId, role, status],
    };

    // Execute the query
    await pool.query(query);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(`Error upserting user operator record:`, error);
    throw error;
  }
};

// Delete User Operator record
const deleteUserOperatorQuery =
  "DELETE FROM erc.user_operator WHERE user_id = $1";

// 🛠️ Function: deletes user operator based on user_id
export const deleteUserOperatorRecord = async (userId: string) => {
  try {
    const query = {
      text: deleteUserOperatorQuery,
      values: [userId],
    };
    // Execute the query
    await pool.query(query);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(`Error deleting user operator record:`, error);
    throw error;
  }
};
