"use client";

import { useRouter } from "next/navigation";
import SingleStepTaskListForm from "@bciers/components/form/SingleStepTaskListForm";
import { RJSFSchema } from "@rjsf/utils";
import { operationUiSchema } from "../../data/jsonSchema/operation";

interface OperationFormData {
  operation_name: string;
  operation_type: string;
  primary_naics_code_id: number;
  secondary_naics_code_id?: number;
  tertiary_naics_code_id?: number;
  reporting_activities?: string[];
  operation_has_multiple_operators: boolean;
  multiple_operators_array?: {
    mo_is_extraprovincial_company: boolean;
    mo_legal_name?: string;
    mo_attorney_street_address?: string;
    mo_municipality?: string;
    mo_province?: string;
    mo_postal_code?: string;
  }[];
  registration_category?: string;
  regulated_operation?: string;
  new_entrant_operation?: string;
  regulated_products?: string;
  forcasted_emmisions?: string;
}

const OperationForm = ({ schema }: { schema: RJSFSchema }) => {
  const router = useRouter();

  const handleSubmit = async (data: { formData?: OperationFormData }) => {
    console.log(data);
  };

  return (
    <SingleStepTaskListForm
      schema={schema}
      uiSchema={operationUiSchema}
      formData={{}}
      onSubmit={handleSubmit}
      onCancel={() => router.push("/registration/operations")}
    />
  );
};

export default OperationForm;
