import OperationsForm, {
  OperationsFormData,
} from "@/app/components/form/OperationsForm";
import { operationSchema } from "@/app/utils/jsonSchema/operations";
import { BusinessStructure } from "@/app/components/routes/select-operator/form/types";
import { RJSFSchema } from "@rjsf/utils";
import { actionHandler } from "@/app/utils/actions";
import OperationReview from "./OperationReview";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import { Fade } from "@mui/material";
import { Status } from "@/app/utils/enums";
import { Operation as OperationInt } from "@/app/components/routes/operations/types";

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
export async function getReportingActivities() {
  try {
    return await actionHandler(
      "registration/reporting_activities",
      "GET",
      "/operations",
    );
  } catch (error) {
    // Handle the error here or rethrow it to handle it at a higher level
    throw error;
  }
}

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

// 🛠️ Function to create an operation schema with updated enum values
export const createOperationSchema = (
  schema: RJSFSchema,
  naicsCodes: { id: number; naics_code: string; naics_description: string }[],
  regulatedProducts: {
    id: number;
    name: string;
  }[],
  reportingActivities: {
    id: number;
    name: string;
  }[],
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
  if (Array.isArray(reportingActivities)) {
    localSchema.properties.operationPage1.properties.reporting_activities.items.enum =
      reportingActivities.map((activity) => activity?.id);

    localSchema.properties.operationPage1.properties.reporting_activities.items.enumNames =
      reportingActivities.map((activity) => activity?.name);
  }
  // business structures
  const businessStructureOptions = businessStructureList?.map(
    (businessStructure) => ({
      type: "string",
      title: businessStructure.label,
      enum: [businessStructure.id],
      value: businessStructure.id,
    }),
  );

  if (Array.isArray(businessStructureOptions)) {
    localSchema.properties.operationPage1.allOf[2].then.properties.multiple_operators_array.items.properties.mo_business_structure.anyOf =
      businessStructureOptions;
  }

  return localSchema;
};

// 🧩 Main component
export default async function Operation({ numRow }: { numRow?: number }) {
  const codes = await getNaicsCodes();
  const products = await getRegulatedProducts();
  const activities = await getReportingActivities();
  const businessStructures: BusinessStructure[] = await getBusinessStructures();

  let operation: OperationInt | undefined;

  // Check that numRow is a number so we don't try to fetch an operation with a string eg: "create"
  if (numRow && !isNaN(Number(numRow))) {
    operation = await getOperation(numRow);
  }

  const businessStructuresList = businessStructures?.map(
    (businessStructure: BusinessStructure) => ({
      id: businessStructure.name,
      label: businessStructure.name,
    }),
  );

  const exemptionIdJSX: JSX.Element = (
    <div className="flex items-center gap-3 mt-4">
      <CheckCircleIcon
        fontSize="large"
        color="success"
        sx={{ width: "3rem", height: "3rem" }}
      />
      <div>
        <p className="my-0">
          This operation registration request was approved. <b>BORO ID: </b>{" "}
          {operation?.bc_obps_regulated_operation}
        </p>
        <p className="my-0">
          You can use the BC OBPS Regulated Operation (BORO) ID above to apply
          for carbon tax exemption with the BC Ministry of Finance.
        </p>
      </div>
    </div>
  );

  const operationRegistrationRejectedJSX: JSX.Element = (
    <div className="flex items-start gap-3 mt-4">
      <CancelIcon fontSize="large" color="error" />
      <div>
        <p className="mt-0">
          This operation registration request was rejected.
        </p>
        <p className="mb-0">
          <b>Reason for rejection from Program Area:</b>
        </p>
        <em>Check your email</em>
      </div>
    </div>
  );

  const showRegistrationRequestResult: boolean | undefined =
    operation &&
    [Status.REJECTED, Status.APPROVED].includes(operation?.status as Status);

  // Render the OperationsForm component with schema and formData if the operation already exists
  return (
    <>
      <OperationReview operation={operation} />
      {showRegistrationRequestResult && (
        <Fade in={showRegistrationRequestResult}>
          {operation?.bc_obps_regulated_operation
            ? exemptionIdJSX
            : operationRegistrationRejectedJSX}
        </Fade>
      )}
      <OperationsForm
        schema={createOperationSchema(
          operationSchema,
          codes,
          products,
          activities,
          businessStructuresList,
        )}
        formData={operation as OperationsFormData}
      />
    </>
  );
}
