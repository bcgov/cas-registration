"use client";

import { BC_GOV_LINKS_COLOR } from "@bciers/styles/colors";
import Link from "next/link";
import Form from "@bciers/components/form/FormBase";
import { useRouter } from "next/navigation";
import { actionHandler } from "@bciers/actions";
import {
  useValidationErrors,
  handleApiResponse,
} from "@bciers/components/validationErrors";
import { SelectOperatorFormData } from "../userOperators/types";
import { selectOperatorUiSchema } from "../../data/jsonSchema/selectOperator";
import { selectOperatorSchema } from "../../data/jsonSchema/selectOperator";
import { validationUIConfig } from "@/administration/app/components/validationErrors/config";
import type { ValidationKey } from "@/administration/app/components/validationErrors/types";

export default function SelectOperatorForm() {
  const router = useRouter();
  const { setErrors, renderedErrors } = useValidationErrors<ValidationKey>({
    config: validationUIConfig,
  });

  const handleSubmit = async (data: { formData?: SelectOperatorFormData }) => {
    setErrors(undefined);

    const queryParam = `?${data.formData?.search_type}=${
      data.formData?.[
        data.formData?.search_type as keyof SelectOperatorFormData
      ]
    }`;

    const response = await actionHandler(
      `registration/operators/search${queryParam}`,
      "GET",
      "/select-operator",
    );

    const isSuccess = handleApiResponse<ValidationKey>(
      response,
      setErrors,
      "operator_not_found",
    );
    if (!isSuccess) {
      return;
    }

    const operator = Array.isArray(response) ? response[0] : response;

    if (!operator?.id) {
      handleApiResponse<ValidationKey>(
        { error: "No operator found matching the provided criteria." },
        setErrors,
        "operator_not_found",
      );
      return;
    }

    router.push(
      `/select-operator/confirm/${operator.id}?title=${operator.legal_name}`,
    );
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
          {renderedErrors}
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
