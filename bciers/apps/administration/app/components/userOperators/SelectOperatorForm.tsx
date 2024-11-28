"use client";
import { BC_GOV_LINKS_COLOR } from "@bciers/styles/colors";
import Link from "next/link";
import Form from "@bciers/components/form/FormBase";
import { useState } from "react";
import { Alert } from "@mui/material";
import { useRouter } from "next/navigation";
import { actionHandler } from "@bciers/actions";
import { SelectOperatorFormData } from "../userOperators/types";
import { selectOperatorUiSchema } from "../../data/jsonSchema/selectOperator";
import { selectOperatorSchema } from "../../data/jsonSchema/selectOperator";

export default function SelectOperatorForm() {
  const [errorList, setErrorList] = useState([] as any[]);
  const router = useRouter();
  const handleSubmit = async (data: { formData?: SelectOperatorFormData }) => {
    const queryParam = `?${data.formData?.search_type}=${data.formData?.[
      data.formData?.search_type as keyof SelectOperatorFormData
    ]}`;

    const response = await actionHandler(
      `registration/v2/operators${queryParam}`,
      "GET",
      "/select-operator",
    );

    if (response.error) {
      setErrorList([{ message: response.error }]);
      return;
    }
    // If the response is an array, we want the first element
    let operatorId;
    let operatorLegalName;
    if (response.length > 0) {
      operatorId = response[0].id;
      operatorLegalName = response[0].legal_name;
    } else {
      operatorId = response.id;
      operatorLegalName = response.legal_name;
    }
    router.push(
      `/select-operator/confirm/${operatorId}?title=${operatorLegalName}`,
    );
  };
  return (
    <section className="text-center text-2xl flex flex-col">
      <Form
        formContext={{ endpoint: "registration/v2/operators/search" }}
        schema={selectOperatorSchema}
        onSubmit={handleSubmit}
        uiSchema={selectOperatorUiSchema}
        className="mx-auto"
      >
        {errorList.length > 0 &&
          errorList.map((e: any) => (
            <Alert key={e.message} severity="error">
              {e.message}
            </Alert>
          ))}
        <></>
      </Form>
      <p>
        Don&apos;t see the operator?{" "}
        <Link
          href="/select-operator/add-operator"
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
