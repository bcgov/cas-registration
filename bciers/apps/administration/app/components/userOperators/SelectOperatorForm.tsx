"use client";
import { BC_GOV_LINKS_COLOR } from "@bciers/styles/colors";
import Link from "next/link";
import Form from "@bciers/components/form/FormBase";
import { useRouter } from "next/navigation";
import { actionHandler } from "@bciers/actions";
import { SelectOperatorFormData } from "@/administration/app/components/userOperators/types";
import {
  selectOperatorSchema,
  selectOperatorUiSchema,
} from "@/administration/app/data/jsonSchema/selectOperator";
import {
  useValidationErrors,
  handleApiResponse,
  setClientError,
} from "@bciers/components/validationErrors";

export default function SelectOperatorForm() {
  const { setErrors, renderedErrors } = useValidationErrors();
  const router = useRouter();

  const handleSubmit = async (data: { formData?: SelectOperatorFormData }) => {
    // Reset previous errors on new submission
    setErrors(undefined);

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
      const isSuccess = handleApiResponse(response, setErrors);
      if (!isSuccess) return;

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
        const message = "Unexpected response format from server.";
        setClientError(message, setErrors);
        return;
      }

      router.push(
        `/select-operator/confirm/${operatorId}?title=${operatorLegalName}`,
      );
    } catch (err) {
      setClientError(err, setErrors);
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
          <div className="w-full max-w-xl mx-auto">{renderedErrors}</div>
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
