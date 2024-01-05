"use client";
import SelectOperatorRequestAccessConfirmPage from "@/app/components/routes/select-operator/request-access/confirm/Page";
import { actionHandler } from "@/app/utils/actions";
import Form from "@rjsf/core";
import { customizeValidator } from "@rjsf/validator-ajv8";

export default function Page({ params }: { readonly params: { id: number } }) {
  const customFormats = {
    phone: /\(?\d{3}\)?[\s-]?\d{3}[\s-]?\d{4}$/,
    "postal-code":
      /^[ABCEGHJ-NPRSTVXY]\d[ABCEGHJ-NPRSTV-Z][ -]?\d[ABCEGHJ-NPRSTV-Z]\d$/i,
    bc_corporate_registry_number: "^[A-Za-z]{1,3}\\d{7}$",
  };
  const validator = customizeValidator({ customFormats });
  return (
    <Form
      schema={{
        title: "A registration form",
        description: "A simple form example.",
        type: "object",

        properties: {
          boundary_map: {
            type: "string",
            format: "data-url",
            title: "Single file",
          },
          randomfield: {
            type: "string",
            title: "random extra field for testing what happens",
          },
        },
      }}
      validator={validator}
      onSubmit={async (data) => {
        console.log("data.formdata", data.formData);

        const response = await actionHandler(
          `registration/handle-file`,
          "POST",
          "",
          // can't pass a File class to a server action so any dataURL transformation will have to happen middleware or backend
          { body: JSON.stringify(data.formData) }
        );

        if (response.error) {
          console.log("bad things happened");
          return;
        }
      }}
    />
  );
}
