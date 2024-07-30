import { UUID } from "crypto";
import { validate as isValidUUID } from "uuid";
import FacilityInformationForm from "apps/registration/app/components/operations/registration/FacilityInformationForm";
import { facilityInformationSchema } from "apps/registration/app/data/jsonSchema/operationRegistration/facilityInformation";
import { facilitiesSchemaLfo } from "apps/administration/app/data/jsonSchema/facilitiesLfo";
import { RJSFSchema } from "@rjsf/utils";

// 🛠️ Function to create a facility information schema with updated enum values
export const createFacilityInformationSchema = (
  schema: RJSFSchema,
  lfoSchema: RJSFSchema,
) => {
  const localSchema = JSON.parse(JSON.stringify(schema));

  localSchema.properties.facility_information_array.items.properties =
    lfoSchema.properties;

  return localSchema;
};

const FacilityInformationPage = ({
  operation,
  step,
  steps,
}: {
  operation: UUID | "create";
  step: number;
  steps: string[];
}) => {
  // Don't fetch operation if UUID is invalid or operation === "create"
  if (operation && isValidUUID(operation)) {
    // Fetch formData data here
  }

  // Will need to pull this from the formData;
  const isOperationLfo = true;

  const formSchema = isOperationLfo
    ? createFacilityInformationSchema(
        facilityInformationSchema,
        facilitiesSchemaLfo,
      )
    : facilityInformationSchema;

  return (
    <FacilityInformationForm
      formData={{}}
      operation={operation}
      schema={formSchema}
      step={step}
      steps={steps}
    />
  );
};

export default FacilityInformationPage;
