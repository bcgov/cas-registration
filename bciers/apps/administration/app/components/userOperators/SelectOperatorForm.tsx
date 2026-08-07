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
    // Reset previous errors on new submission
    setErrorList([]);

    const queryParam = `?${data.formData?.search_type}=${
      data.formData?.[
        data.formData?.search_type as keyof SelectOperatorFormData
      ]
    }`;

    try {
      const response = await actionHandler(
        `registration/operators/search${queryParam}`,
        "GET",
        "/select-operator",
      );

      // Updated check: handles response.error, response.message, or response.detail
      const errorMessage =
        response?.error || response?.message || response?.detail;

      if (errorMessage) {
        console.log("[ERROR DETECTED] Setting error message:", errorMessage);
        setErrorList([
          {
            message:
              typeof errorMessage === "string"
                ? errorMessage
                : JSON.stringify(errorMessage),
          },
        ]);
        return;
      }

      // If the response is an array, we want the first element
      let operatorId;
      let operatorLegalName;
      if (Array.isArray(response) && response.length > 0) {
        operatorId = response[0].id;
        operatorLegalName = response[0].legal_name;
      } else if (response && response.id) {
        operatorId = response.id;
        operatorLegalName = response.legal_name;
      } else {
        setErrorList([{ message: "Unexpected response format from server." }]);
        return;
      }

      router.push(
        `/select-operator/confirm/${operatorId}?title=${operatorLegalName}`,
      );
    } catch (err: any) {
      setErrorList([
        { message: err?.message || "An unexpected error occurred." },
      ]);
    }
  };

  return (
    <div className="container mx-auto">
      <section className="text-center text-2xl flex flex-col">
        <Form
          formContext={{ endpoint: "registration/operators/search" }}
          schema={selectOperatorSchema}
          onSubmit={handleSubmit}
          uiSchema={selectOperatorUiSchema}
          className="mx-auto"
        >
          {/* Needed to display errors from cra number */}
          {errorList.length > 0 &&
            errorList.map((e: any, index: number) => {
              return (
                <Alert key={index} severity="error" className="mt-2">
                  {e.message}
                </Alert>
              );
            })}
          {/* Needed to prevent rendering of standard submit buttons by RJSF */}
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
    </div>
  );
}
