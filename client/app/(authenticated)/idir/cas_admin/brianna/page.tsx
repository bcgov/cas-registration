"use client";
import SelectOperatorRequestAccessConfirmPage from "@/app/components/routes/select-operator/request-access/confirm/Page";
import { actionHandler } from "@/app/utils/actions";
import Form from "@rjsf/core";
import { customizeValidator } from "@rjsf/validator-ajv8";

function dataURLtoFile(dataurl: string, filename: string) {
  console.log("dataurl", dataurl);
  var arr = dataurl.split(","),
    mime = arr[0].match(/:(.*?);/)[1],
    bstr = atob(arr[arr.length - 1]),
    n = bstr.length,
    u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new File([u8arr], filename, { type: mime });
}

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
          file: {
            type: "string",
            format: "data-url",
            title: "Single file",
          },
          randomfield: {
            type: "string",
            title: "random filed",
          },
        },
      }}
      validator={validator}
      onSubmit={async (data) => {
        console.log("data.formdata", data.formData);

        const response = await actionHandler(
          `registration/upload`,
          "POST",
          "",
          // can't do this, can't pass a class to a server action
          // b might need to write a new handler for files --oh nooooo, it's probably middleware
          // dataURLtoFile(data.formData.file, "bri")
          { body: JSON.stringify(data.formData) },
        );

        // const response = await fetch(
        //   `${process.env.API_URL}registration/upload`,
        //   {
        //     method: "POST",

        //     body: data.formData,
        //   }
        // );

        if (response.error) {
          console.log("bad things happened");
          return;
        }
      }}
    />
  );
}
