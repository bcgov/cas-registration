"use client";

import { uiSchemaMap } from "@reporting/src/app/components/activities/uiSchemas/schemaMaps";
import { nonAttributableEmissionUiSchema } from "@reporting/src/data/jsonSchema/nonAttributableEmissions/nonAttributableEmissions";
import { productionDataUiSchema } from "@reporting/src/data/jsonSchema/productionData";
import { emissionAllocationUiSchema } from "@reporting/src/data/jsonSchema/facility/facilityEmissionAllocation";
import { emissionSummaryUiSchema } from "@reporting/src/data/jsonSchema/emissionSummary";
import { withTheme } from "@rjsf/core";
import { customizeValidator } from "@rjsf/validator-ajv8";
import finalReviewTheme from "@reporting/src/app/components/finalReview/formCustomization/finalReviewTheme";
import { additionalReportingDataUiSchema } from "@reporting/src/data/jsonSchema/additionalReportingData/additionalReportingData";
import { complianceSummaryUiSchema } from "@reporting/src/data/jsonSchema/complianceSummary";

// These uiSchemas need to be loaded on the client side, they contain interactive, stateful components.
const finalReviewSchemaMap: { [key: string]: any } = {
  ...uiSchemaMap,
  nonAttributableEmissions: nonAttributableEmissionUiSchema,
  productionData: productionDataUiSchema,
  emissionAllocation: emissionAllocationUiSchema,
  additionalReportingData: additionalReportingDataUiSchema,
  operationEmissionSummary: emissionSummaryUiSchema,
  complianceSummary: complianceSummaryUiSchema,
};

const resolveUiSchema = (uiSchema: any) => {
  if (typeof uiSchema !== "string") return uiSchema;
  return finalReviewSchemaMap[uiSchema];
};

const Form = withTheme(finalReviewTheme);

// Helper function to render the Form component
const FinalReviewFormRenderer = ({
  idx,
  form,
}: {
  idx: number;
  form: any;
  data: any;
}) => (
  <Form
    key={idx}
    schema={form.schema}
    formData={form.data}
    uiSchema={{
      ...resolveUiSchema(form.uiSchema),
      "ui:submitButtonOptions": { norender: true },
    }}
    readonly={true}
    formContext={form.context || {}}
    validator={customizeValidator({})}
  />
);

export default FinalReviewFormRenderer;
