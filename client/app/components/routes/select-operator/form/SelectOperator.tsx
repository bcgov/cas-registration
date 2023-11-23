import { RJSFSchema } from "@rjsf/utils";
import SelectOperatorForm from "@/app/components/form/SelectOperatorForm";
import Link from "next/link";
import { selectOperatorSchema } from "@/app/utils/jsonSchema/selectOperator";
import { BC_GOV_LINKS_COLOR } from "@/app/styles/colors";
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
    <section className="text-center my-auto text-2xl">
      <SelectOperatorForm schema={createSelectOperatorSchema(operatorsList)} />
      <p className="mt-4">
        Don&apos;t see the operator?{" "}
        <Link
          href="#"
          className="underline hover:no-underline mr-2"
          style={{ color: BC_GOV_LINKS_COLOR }}
        >
          Add Operator
        </Link>
        instead
      </p>
    </section>
  );
}
