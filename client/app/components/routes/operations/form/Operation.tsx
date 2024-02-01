import OperationsForm, {
  OperationsFormData,
} from "@/app/components/form/OperationsForm";
import {
  operationSchema,
  operationInternalUserSchema,
} from "@/app/utils/jsonSchema/operations";
import { UserProfileFormData } from "@/app/components/form/formDataTypes";
import { RJSFSchema } from "@rjsf/utils";
import { actionHandler } from "@/app/utils/actions";
import OperationReview from "./OperationReview";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import { Fade } from "@mui/material";
import { Status } from "@/app/utils/enums";
import { Operation as OperationInt } from "@/app/components/routes/operations/types";
import Link from "next/link";
import OperationReviewForm from "@/app/components/form/OperationReviewForm";
import { BusinessStructure } from "@/app/components/routes/select-operator/form/types";

// 🚀 API call: GET user's data
async function getUserFormData(): Promise<
  UserProfileFormData | { error: string }
> {
  return actionHandler(`registration/user-profile`, "GET", "");
}

// 🛠️ Function to fetch NAICS codes
async function getNaicsCodes() {
  try {
    return await actionHandler(
      "registration/naics_codes",
      "GET",
      "/dashboard/operations",
    );
  } catch (error) {
    // Handle the error here or rethrow it to handle it at a higher level
    throw error;
  }
}

export async function getRegulatedProducts() {
  try {
    return await actionHandler(
      "registration/regulated_products",
      "GET",
      "/operations",
    );
  } catch (error) {
    // Handle the error here or rethrow it to handle it at a higher level
    throw error;
  }
}

// Commenting out this field for MVP
// export async function getReportingActivities() {
//   try {
//     return await actionHandler(
//       "registration/reporting_activities",
//       "GET",
//       "/operations",
//     );
//   } catch (error) {
//     // Handle the error here or rethrow it to handle it at a higher level
//     throw error;
//   }
// }

// 🛠️ Function to fetch the business structures
async function getBusinessStructures() {
  return actionHandler(
    `registration/business_structures`,
    "GET",
    `/dashboard/select-operator/user-operator`,
  );
}

// 🛠️ Function to fetch an operation by ID
async function getOperation(id: number) {
  try {
    return await actionHandler(
      `registration/operations/${id}`,
      "GET",
      `/operations/${id}`,
    );
  } catch (error) {
    // Handle the error here or rethrow it to handle it at a higher level
    throw error;
  }
}

// 🛠️ Function to fetch an operator by ID
async function getOperator(id: number) {
  try {
    return await actionHandler(
      `registration/operators/${id}`,
      "GET",
      `/operations/${id}`,
    );
  } catch (error) {
    // Handle the error here or rethrow it to handle it at a higher level
    throw error;
  }
}

// 🛠️ Function to create an operation schema with updated enum values
export const createOperationSchema = (
  schema: RJSFSchema,
  naicsCodes: { id: number; naics_code: string; naics_description: string }[],
  regulatedProducts: {
    id: number;
    name: string;
  }[],
  // reportingActivities: {
  //   id: number;
  //   name: string;
  // }[],
  businessStructureList: { id: string; label: string }[],
) => {
  const localSchema = JSON.parse(JSON.stringify(schema));
  // naics codes
  if (Array.isArray(naicsCodes)) {
    // add to nested operation page1 schema
    localSchema.properties.operationPage1.properties.naics_code_id.anyOf =
      naicsCodes.map((code) => {
        return {
          const: code?.id,
          title: `${code?.naics_code} - ${code?.naics_description}`,
        };
      });
  }
  // regulated products
  if (Array.isArray(regulatedProducts)) {
    localSchema.properties.operationPage1.properties.regulated_products.items.enum =
      regulatedProducts.map((product) => product?.id);

    localSchema.properties.operationPage1.properties.regulated_products.items.enumNames =
      regulatedProducts.map((product) => product?.name);
  }
  // reporting activities
  // if (Array.isArray(reportingActivities)) {
  //   localSchema.properties.operationPage1.properties.reporting_activities.items.enum =
  //     reportingActivities.map((activity) => activity?.id);
  //
  //   localSchema.properties.operationPage1.properties.reporting_activities.items.enumNames =
  //     reportingActivities.map((activity) => activity?.name);
  // }
  //business structures
  const businessStructureOptions = businessStructureList?.map(
    (businessStructure) => ({
      type: "string",
      title: businessStructure.label,
      enum: [businessStructure.id],
      value: businessStructure.id,
    }),
  );

  if (Array.isArray(businessStructureOptions)) {
    // for operator

    localSchema.properties.userOperatorPage1.properties.business_structure = {
      ...localSchema.properties.userOperatorPage1.properties.business_structure,
      anyOf: businessStructureOptions,
    };
    // localSchema.properties.operationPage1.allOf[2].then.properties.multiple_operators_array.items.properties.mo_business_structure.anyOf =
    //   businessStructureOptions;
  }

  return localSchema;
};

// 🧩 Main component
export default async function Operation({ numRow }: { numRow?: number }) {
  let userProfileFormData: UserProfileFormData | { error: string } =
    await getUserFormData();
  const currentUserAppRole = (userProfileFormData as UserProfileFormData)
    ?.app_role?.role_name;
  const isCasInternal =
    currentUserAppRole?.includes("cas") &&
    !currentUserAppRole?.includes("pending");
  const codes = await getNaicsCodes();
  const products = await getRegulatedProducts();
  /*   const activities = await getReportingActivities(); */

  let operation: OperationInt | undefined;
  let operator: any;
  let businessStructures: BusinessStructure[] = [];

  // Check that numRow is a number so we don't try to fetch an operation with a string eg: "create"
  if (numRow && !isNaN(Number(numRow))) {
    operation = await getOperation(numRow);
  }

  if (operation?.operator_id && isCasInternal) {
    // fetch operator data for internal users
    operator = await getOperator(operation?.operator_id);
    businessStructures = await getBusinessStructures();
  }

  const businessStructuresList = businessStructures?.map(
    (businessStructure: BusinessStructure) => ({
      id: businessStructure.name,
      label: businessStructure.name,
    }),
  );

  const boroId: JSX.Element = (
    <div className="flex items-center gap-3 mt-4">
      <CheckCircleIcon
        fontSize="large"
        color="success"
        sx={{ width: "3rem", height: "3rem" }}
      />
      <div>
        {isCasInternal ? (
          <p>
            This operation’s application for a B.C. OBPS Regulated Operation ID
            was approved.
          </p>
        ) : (
          <>
            {" "}
            <p className="my-0">
              <b>B.C. OBPS Regulated Operation ID: </b>{" "}
              {operation?.bc_obps_regulated_operation}
            </p>
            <p className="my-0">
              You will need this B.C. OBPS Regulated Operation ID to claim an
              exemption from carbon tax. For information about the exemption and
              how to claim it, please see the{" "}
              <Link href="https://www2.gov.bc.ca/gov/content?id=3EAC7D1EBBDA41F6937BA1F1A8A202F3">
                carbon tax exemption page
              </Link>
              .
            </p>
          </>
        )}
      </div>
    </div>
  );

  const operationRegistrationDeclinedJSX: JSX.Element = (
    <div className="flex items-start gap-3 mt-4">
      <CancelIcon fontSize="large" color="error" />
      <div>
        <p className="mt-0">
          This operation’s application for a B.C. OBPS Regulated Operation ID
          was declined.
        </p>
      </div>
    </div>
  );

  const showRegistrationRequestResult: boolean | undefined =
    operation &&
    [Status.DECLINED, Status.APPROVED].includes(operation?.status as Status);

  const pointOfContactEmail = operation?.email ?? undefined;

  const formData = {
    ...operation,
    ...operator,
    // Add the correct point of contact data if there is no point of contact data
    ...(!pointOfContactEmail && {
      ...userProfileFormData,
    }),
  };
  const userEmail = (userProfileFormData as UserProfileFormData)?.email;
  // If tpoint of contact data is an external user, we want to populate the external point of contact fields
  const isExternalPointOfContact =
    userEmail !== pointOfContactEmail && pointOfContactEmail !== undefined;
  // empty array is not a valid value for multiple_operators_array as empty default should be [{}]
  // to avoid buggy behaviour opening
  const isMultipleOperatorsArray =
    formData &&
    Array.isArray(formData?.multiple_operators_array) &&
    formData.multiple_operators_array.length > 0;

  // We need to convert some of the information received from django into types RJSF can read.  If you spread anything and it has the same keys as operation (e.g. id, created_by), watch out for accidentally overwriting things.
  const transformedFormData = {
    ...formData,
    // Add the correct point of contact data

    ...(isExternalPointOfContact && {
      external_point_of_contact_first_name: formData?.first_name,
      external_point_of_contact_last_name: formData?.last_name,
      external_point_of_contact_email: formData?.email,
      external_point_of_contact_phone_number: formData?.phone_number,
      external_point_of_contact_position_title: formData?.position_title,
    }),

    "Did you submit a GHG emissions report for reporting year 2022?":
      formData?.previous_year_attributable_emissions ? true : false,
    is_external_point_of_contact: isExternalPointOfContact,
    // fix for null values not opening the multiple operators form if loading a previously saved form
    multiple_operators_array: isMultipleOperatorsArray
      ? formData?.multiple_operators_array
      : [{}],
  };
  // Render the OperationsForm component with schema and formData if the operation already exists
  return (
    <>
      <OperationReview operation={operation} />
      {showRegistrationRequestResult && (
        <Fade in={showRegistrationRequestResult}>
          {operation?.bc_obps_regulated_operation
            ? boroId
            : operationRegistrationDeclinedJSX}
        </Fade>
      )}
      {isCasInternal ? (
        <OperationReviewForm
          schema={createOperationSchema(
            operationInternalUserSchema,
            codes,
            products,
            businessStructuresList,
          )}
          formData={transformedFormData as OperationsFormData}
        />
      ) : (
        <OperationsForm
          schema={createOperationSchema(
            operationSchema,
            codes,
            products,
            [],
            // activities,
            // businessStructuresList,
          )}
          formData={transformedFormData as OperationsFormData}
        />
      )}
    </>
  );
}
