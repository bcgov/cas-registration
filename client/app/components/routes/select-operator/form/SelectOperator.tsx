import { RJSFSchema } from "@rjsf/utils";
import SelectOperatorForm from "@/app/components/form/SelectOperatorForm";
import { selectOperatorSchema } from "@/app/utils/jsonSchema/selectOperator";
import { actionHandler } from "@/app/utils/actions";
import { Operator } from "@/app/components/routes/select-operator/form/types";

async function getOperators() {
  return actionHandler(
    "registration/operators",
    "GET",
    "/dashboard/select-operator",
  );
}

// 🛠️ Function to create a select operator schema with updated enum values
export const createSelectOperatorSchema = (
  operatorsList: { id: number; label: string }[],
): RJSFSchema => {
  const localSchema = JSON.parse(JSON.stringify(selectOperatorSchema));
  localSchema.properties.operator_id = {
    ...localSchema.properties.operator_id,
    anyOf: operatorsList?.map((operator) => ({
      type: "number",
      title: operator.label,
      enum: [operator.id],
      value: operator.id,
    })),
  };
  return localSchema;
};

export default async function SelectOperator() {
  const operators: Operator[] | { error: string } = await getOperators();

  if ("error" in operators) {
    return <div>Server Error. Please try again later.</div>;
  }

  const operatorsList = operators?.map((operator: Operator) => ({
    id: operator.id,
    label: operator.legal_name,
  }));

  return (
    <SelectOperatorForm schema={createSelectOperatorSchema(operatorsList)} />
  );
}
