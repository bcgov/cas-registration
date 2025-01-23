"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import SingleStepTaskListForm from "@bciers/components/form/SingleStepTaskListForm";
import { actionHandler } from "@bciers/actions";
import { ContactFormData } from "./types";
import { FormMode } from "@bciers/utils/src/enums";
import { contactsUiSchema } from "@/administration/app/data/jsonSchema/contact";
import { useSessionRole } from "@bciers/utils/src/sessionUtils";

interface Props {
  schema: any;
  formData: ContactFormData;
  isCreating?: boolean;
  allowEdit?: boolean;
}

const NewOperationMessage = () => (
  <>
    <b>Note: </b>To assign this representative to an operation, go to the
    operation information form
  </>
);
export default function ContactForm({
  formData,
  schema,
  isCreating,
  allowEdit,
}: Readonly<Props>) {
  const router = useRouter();
  const [error, setError] = useState(undefined);
  const [formState, setFormState] = useState(formData ?? {});
  const [isCreatingState, setIsCreatingState] = useState(isCreating);
  const [key, setKey] = useState(Math.random());
  const role = useSessionRole();

  return (
    <SingleStepTaskListForm
      key={key}
      error={error}
      schema={schema}
      uiSchema={contactsUiSchema}
      formData={formState}
      formContext={{ userRole: role }}
      mode={isCreatingState ? FormMode.CREATE : FormMode.READ_ONLY}
      allowEdit={allowEdit}
      inlineMessage={
        isCreatingState && !role.includes("cas") && <NewOperationMessage />
      }
      onSubmit={async (data: { formData?: any }) => {
        const updatedFormData = { ...formState, ...data.formData };
        setFormState(updatedFormData);

        const method = isCreatingState ? "POST" : "PUT";
        const endpoint = isCreatingState
          ? "registration/contacts"
          : `registration/contacts/${formState.id}`;
        const pathToRevalidate = isCreatingState
          ? "/contacts"
          : `/contacts/${formState.id}`;
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
          return { error: response.error };
        }

        if (isCreatingState) {
          setIsCreatingState(false);
          setFormState((prevState) => ({
            ...prevState,
            id: response.id,
          }));
        } else {
          setKey(Math.random());
        }
        const replaceUrl = `/contacts/${
          method === "POST" ? response.id : formState.id
        }?contacts_title=${response.first_name} ${response.last_name}`;
        router.replace(replaceUrl);
      }}
      onCancel={() => router.replace("/contacts")}
    />
  );
}
