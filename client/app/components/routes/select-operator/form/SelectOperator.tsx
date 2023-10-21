import { RJSFSchema } from "@rjsf/utils";
import SelectOperatorForm from "@/app/components/form/SelectOperatorForm";
import Link from "next/link";
import { selectOperatorSchema } from "@/app/utils/jsonSchema/selectOperator";
import { BC_GOV_LINKS_COLOR } from "@/app/styles/colors";
import { fetchAPI } from "@/app/utils/api";
import { Operator } from "@/app/components/routes/select-operator/form/types";

// 📚 runtime mode for dynamic data to allow build w/o api
export const runtime = "edge";

export async function getOperators() {
  try {
    return await fetchAPI("registration/operators");
  } catch (e) {
    return null;
  }
}

// 🛠️ Function to create a select operator schema with updated enum values
export const createSelectOperatorSchema = (
  operatorsList: { id: number; label: string }[],
): RJSFSchema => {
  const localSchema = JSON.parse(JSON.stringify(selectOperatorSchema));
  localSchema.properties.operator_id = {
    ...localSchema.properties.operator_id,
    anyOf: operatorsList.map((operator) => {
      return {
        type: "number",
        title: operator.label,
        enum: [operator.id],
        value: operator.id,
      };
    }),
  };
  return localSchema;
};

export default async function SelectOperator() {
  const operators: Operator[] = await getOperators();

  if (!operators) {
    return <div>Server Error. Please try again later.</div>;
  }

  const operatorsList = operators?.map((operator) => {
    return {
      id: operator.id,
      label: operator.legal_name,
    };
  });

  return (
    <section className="text-center my-60 text-2xl flex flex-col gap-3">
      <p>
        Hi <b>John!</b> {/* TODO: replace with user name */}
      </p>
      <p>Which operator would you like to log in to?</p>
      <p>
        Please search by the business name or the Canada Revenue Agency (CRA)
        Business Number below.
      </p>
      <SelectOperatorForm schema={createSelectOperatorSchema(operatorsList)} />
      <p className="mt-4">
        Don&apos;t see the operator?{" "}
        <Link
          href="#"
          className="underline hover:no-underline"
          style={{ color: BC_GOV_LINKS_COLOR }}
        >
          Add Operator
        </Link>
      </p>
    </section>
  );
}
