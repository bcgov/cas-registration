import Loading from "@/app/components/loading";
import { Suspense } from "react";
import { BC_GOV_LINKS_COLOR } from "@/app/styles/colors";
import Link from "next/link";
import PageBar from "@/app/components/PageBar";
import SelectOperatorForm from "@/app/components/form/SelectOperatorForm";
import { selectOperatorSchema } from "@/app/utils/jsonSchema/selectOperator";
import { RJSFSchema } from "@rjsf/utils";

export const runtime = "edge";
export async function getOperators() {
  try {
    const operators = await fetch(
      `${process.env.API_URL}registration/operators`,
      {
        cache: "no-store",
      },
    );
    return await operators.json();
  } catch (e) {
    return null;
  }
}

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

export interface Operator {
  id: number;
  legal_name: string;
  trade_name: string;
  cra_business_number: string;
  bc_corporate_registry_number: string;
  business_structure: string;
  mailing_address: string;
  bceid: string;
  parent_operator?: number;
  relationship_with_parent_operator?: string;
  compliance_obligee: number;
  date_aso_became_responsible_for_operator: string;
  documents: Array<number>;
  contacts: Array<number>;
  operators: Array<string>;
}

export default async function Page() {
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

  const pageBarLabel: JSX.Element = <div>Select Operator</div>;

  return (
    <>
      <PageBar label={pageBarLabel} />
      <Suspense fallback={<Loading />}>
        <section className="text-center my-60 text-2xl flex flex-col gap-3">
          <p>
            Hi <b>John!</b> {/* TODO: replace with user name */}
          </p>
          <p>Which operator would you like to log in to?</p>
          <p>
            Please search by the business name or the Canada Revenue Agency
            (CRA) Business Number below.
          </p>
          <SelectOperatorForm
            schema={createSelectOperatorSchema(operatorsList)}
          />
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
      </Suspense>
    </>
  );
}
