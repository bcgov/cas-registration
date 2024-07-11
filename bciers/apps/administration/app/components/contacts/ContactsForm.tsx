"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import SingleStepTaskListForm from "@bciers/components/form/SingleStepTaskListForm";
import { actionHandler } from "@bciers/actions";
import { ContactFormData } from "./types";

interface Props {
  schema: any;
  uiSchema: any;
  formData: ContactFormData;
  isCreating?: boolean;
}

export default function ContactsForm({
  formData,
  schema,
  uiSchema,
  isCreating,
}: Readonly<Props>) {
  // @ ts-ignore
  const [error, setError] = useState(undefined);
  const [confirmation, setConfirmation] = useState(false);
  const router = useRouter();
  return (
    <>
      {confirmation && <div>success</div>}
      <SingleStepTaskListForm
        error={error}
        disabled={!isCreating}
        schema={schema}
        uiSchema={uiSchema}
        formData={formData}
        onSubmit={async (data: { formData?: any }) => {
          const method = isCreating ? "POST" : "PUT";
          const endpoint = isCreating ? "registration/contacts" : `tbd`;
          const pathToRevalidate = endpoint; // for now the endpoint is the same as the path to revalidate
          const body = {
            ...data.formData,
          };
          const response = await actionHandler(
            endpoint,
            method,
            pathToRevalidate,
            {
              body: JSON.stringify(body),
            },
          );
          if (response.error) {
            setError(response.error);
            // return error so SingleStepTaskList can re-enable the submit button and user can attempt to submit again
            return { error: response.error };
          }
          setConfirmation(true);
          if (isCreating) {
            router.replace(
              `/contacts/${response.id}?title=${response.name}`,
              // @ts-ignore
              { shallow: true },
            );
          }
        }}
        onCancel={() => router.replace("/contacts")}
      />
    </>
  );
}
