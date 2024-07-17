"use client";

import { UUID } from "crypto";
import { useState } from "react";
import { useRouter } from "next/navigation";
import SingleStepTaskListForm from "@bciers/components/form/SingleStepTaskListForm";
import { actionHandler } from "@bciers/actions";
import { ContactFormData } from "./types";
import getUserData from "./getUserData";

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
  const router = useRouter();
  const [error, setError] = useState(undefined);
  const [formDataState, setFormDataState] = useState(formData);

  // Populate form data using the selected user data
  const handleSelectUserChange = async (userId: UUID) => {
    try {
      const userData: ContactFormData = await getUserData(userId);
      setFormDataState(userData);
    } catch (err) {
      setError("Failed to fetch user data!" as any);
    }
  };
  /*
  {
    "street_address": null,
    "municipality": null,
    "province": null,
    "postal_code": null,
    "first_name": "bc-cas-dev",
    "last_name": "Industry User",
    "email": "email@email.com",
    "phone_number": "+16044015432",
    "position_title": "Code Monkey"
  }
*/
  return (
    <SingleStepTaskListForm
      error={error}
      disabled={!isCreating}
      schema={schema}
      uiSchema={uiSchema}
      formData={formDataState}
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
        if (isCreating) {
          router.replace(
            `/contacts/${response.id}?title=${response.name}`,
            // @ts-ignore
            { shallow: true },
          );
        }
      }}
      customChangeHandler={(data) => {
        if (data.formData?.section1?.selected_user) {
          handleSelectUserChange(data.formData.section1.selected_user);
        }
      }}
      onCancel={() => router.replace("/contacts")}
    />
  );
}
