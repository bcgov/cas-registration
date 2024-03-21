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
// 🛠️ UUID generator
import { v4 } from "uuid";
// 📦 File system
import * as fs from "fs"; // Import for file system access

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
    INSERT INTO erc.operator (legal_name, trade_name, cra_business_number, bc_corporate_registry_number, business_structure_id, status, is_new, id)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    ON CONFLICT (id)
    DO UPDATE SET status = EXCLUDED.status;
  `;
// 🛠️ Function: upserts operator record
export const upsertOperatorRecord = async (
  status: string = OperatorStatus.APPROVED,
  isNew: boolean = false,
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
      isNew,
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

// 🛠️ Function to truncate all tables in erc schema
export const truncateDatabase = async () => {
  // ⛔️ We don't want to truncate tables with production data
  const tablesWithProductionData = [
    "app_role",
    "business_role",
    "business_structure",
    "document_type",
    "naics_code",
    "regulated_product",
    "reporting_activity",
    "user",
  ];
  try {
    const truncateQuery = `
    SET SCHEMA 'erc';
    DO $$
    DECLARE
        statements CURSOR FOR
            SELECT tablename FROM pg_tables
            WHERE schemaname = 'erc'
            AND tablename NOT IN (${tablesWithProductionData.map(
              (table) => `'${table}'`,
            )});
    BEGIN
        FOR stmt IN statements LOOP
            EXECUTE 'TRUNCATE TABLE ' || quote_ident(stmt.tablename) || ' CASCADE;';
        END LOOP;
    END;
    $$ LANGUAGE plpgsql;
    `;
    await pool.query(truncateQuery);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Error truncating database:", error);
    throw error;
  }
};

async function getPrimaryKeyField(modelName: string): Promise<string | null> {
  // Implement logic to query the database schema and retrieve the primary key field for the given modelName
  const query = `
    SELECT kcu.column_name
    FROM information_schema.table_constraints AS tc
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
    JOIN information_schema.tables AS t
      ON tc.table_name = t.table_name
      AND tc.table_schema = t.table_schema
    WHERE tc.constraint_type = 'PRIMARY KEY'
      AND tc.table_schema = 'erc'
      AND t.table_name = '${modelName}';
  `;

  try {
    const result = await pool.query(query);
    return result.rows[0]?.column_name;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(
      `Error retrieving primary key field for model: ${modelName}`,
      error,
    );
    return null;
  }
}

// 🛠️ Function to insert ManyToMany fields of a data model into DB
export const insertManyToManyFields = async (
  modelName: string,
  item: any,
  manyToManyFields: string[],
  id: string | number | undefined,
) => {
  // If the model has ManyToMany fields, we need to insert the values into the ManyToMany table
  for (const manyToManyField of manyToManyFields) {
    const manyToManyValuesList = item.fields[manyToManyField];
    // ManyToMany fields are plural, so we need to remove the last character to get the singular form
    const singularManyToManyField = manyToManyField.slice(0, -1); // e.g. contacts -> contact

    for (const manyToManyValue of manyToManyValuesList) {
      const manyToManyInsertQuery = `
                    INSERT INTO erc.${modelName}_${manyToManyField} (${modelName}_id, ${singularManyToManyField}_id)
                    VALUES (${id}, ${manyToManyValue});
                    `;
      try {
        await pool.query(manyToManyInsertQuery);
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error(
          `Error loading fixture data for ManyToMany field: ${manyToManyField}`,
          error,
        );
      }
    }
  }
};

async function loadFixtureData(data: any[]) {
  // model name in fixture file is in format registration.model
  const modelName = `${data[0].model.split(".")[1]}`;

  // models with UUID primary key that don't have a pk field in the fixture file
  const modelsWithUUIDPrimaryKey = ["operation"];

  // We need to treat ManyToMany fields differently
  const manyToManyFieldsMapping: { [key: string]: string[] } = {
    // Model name: [List of ManyToMany field names]
    operator: ["contacts"],
    // Add entries for other models with ManyToMany fields
  };

  // Loop through each item in the fixture data
  for (let index = 0; index < data.length; index++) {
    let item = data[index];
    const primaryKey = item.pk || null; // if pk provided in fixture file, use it, otherwise null

    // If the model has a ManyToMany field, we need to handle it differently
    // We extract the ManyToMany fields and their values from the item
    // and insert them into the ManyToMany table using a separate SQL query
    const fields = Object.keys(item.fields);
    const fieldsWithoutManyToMany = fields.filter(
      (field) => !manyToManyFieldsMapping[modelName]?.includes(field),
    );
    const values = fieldsWithoutManyToMany.map((field) => item.fields[field]);

    // Determine the ID to be used in the SQL query
    let id;
    switch (true) {
      // If a primary key is provided in the fixture file, use it
      case primaryKey !== null:
        id = `'${primaryKey}'`;
        break;
      // If the model has a UUID primary key, generate a UUID
      case modelsWithUUIDPrimaryKey.includes(modelName):
        id = `'${v4()}'`;
        break;
      // If the model has a PK other than the pk defined in the fixture file, don't use ID
      case ["user", "bc_obps_regulated_operation"].includes(modelName):
        break;
      default:
        id = index + 1;
        break;
    }

    // Placeholder for each field in the SQL query like $1, $2, $3, ...
    const placeholders = fieldsWithoutManyToMany.map(
      (_, placeholderIndex) => `$${placeholderIndex + 1}`,
    );

    // Retrieve primary key field dynamically
    const primaryKeyField = await getPrimaryKeyField(modelName);
    // Handle potential errors (e.g., if the model doesn't exist)
    if (!primaryKeyField) {
      // eslint-disable-next-line no-console
      console.error(
        `Could not determine primary key field for model: ${modelName}`,
      );
      continue;
    }

    let insertQuery;
    if (id) {
      insertQuery = `
      INSERT INTO erc.${modelName} (id, ${fieldsWithoutManyToMany.join(", ")})
      VALUES (${id}, ${placeholders.join(", ")})
      ON CONFLICT (${primaryKeyField})
      DO NOTHING;
      `;
    } else {
      insertQuery = `
      INSERT INTO erc.${modelName} (${fieldsWithoutManyToMany.join(", ")})
      VALUES (${placeholders.join(", ")})
      ON CONFLICT (${primaryKeyField})
      DO NOTHING;
  `;
    }
    try {
      await pool.query(insertQuery, values);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(
        `Error loading fixture data for model: ${modelName}`,
        error,
      );
    }

    // --- ManyToMany fields handling ---
    const manyToManyFields = fields.filter(
      (field) => manyToManyFieldsMapping[modelName]?.includes(field),
    );
    if (manyToManyFields.length > 0)
      insertManyToManyFields(modelName, item, manyToManyFields, id);
  }
}

export async function loadFixtures(fixturePaths: string[]) {
  try {
    for (const fixturePath of fixturePaths) {
      const fixtureData = JSON.parse(fs.readFileSync(fixturePath, "utf-8"));
      await loadFixtureData(fixtureData); // Call separate function for data loading
    }
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Error loading fixtures:", error);
  }
}
