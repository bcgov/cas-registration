"use client";

import { UUID } from "crypto";
import { useState } from "react";
import { useRouter } from "next/navigation";
import SingleStepTaskListForm from "@bciers/components/form/SingleStepTaskListForm";
import { actionHandler } from "@bciers/actions";
import { ContactFormData } from "./types";
import getUserData from "./getUserData";
import { IChangeEvent } from "@rjsf/core";
import { FormMode } from "@bciers/utils/enums";

interface Props {
  schema: any;
  uiSchema: any;
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
  uiSchema,
  isCreating,
  allowEdit,
}: Readonly<Props>) {
  const router = useRouter();
  const [error, setError] = useState(undefined);
  const [formState, setFormState] = useState(formData ?? {});
  const [key, setKey] = useState(Math.random());
  // Keep track of the selected user to compare with the new selected user; Otherwise, we will fall into an infinite loop
  const [selectedUser, setSelectedUser] = useState("");

  // Populate form data using the selected user data
  const handleSelectUserChange = async (userId: UUID) => {
    try {
      setSelectedUser(userId);
      const userData: ContactFormData = await getUserData(userId);
      setFormState(userData);
      // Hack to trigger a re-render to update the form data
      setKey(Math.random());
    } catch (err) {
      setError("Failed to fetch user data!" as any);
    }
  };

  return (
    <SingleStepTaskListForm
      key={key}
      error={error}
      schema={schema}
      uiSchema={uiSchema}
      formData={formState}
      mode={isCreating ? FormMode.CREATE : FormMode.READ_ONLY}
      allowEdit={allowEdit}
      inlineMessage={isCreating && <NewOperationMessage />}
      onSubmit={async (data: { formData?: any }) => {
        setFormState(data.formData);
        const method = isCreating ? "POST" : "PUT";
        const endpoint = isCreating
          ? "registration/contacts"
          : `registration/contacts/${formData.id}`;
        const pathToRevalidate = isCreating
          ? "/contacts"
          : `/contacts/${formData.id}`;
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
          window.history.replaceState(
            null,
            "",
            `/administration/contacts/${response.id}?contacts_title=${response.first_name} ${response.last_name}`,
          );
        } else {
          setKey(Math.random());
        }
      }}
      onChange={(e: IChangeEvent) => {
        let newSelectedUser = e.formData?.section1?.selected_user;
        if (newSelectedUser && newSelectedUser !== selectedUser) {
          // Only fetch user data if the selected user has changed
          handleSelectUserChange(e.formData.section1.selected_user);
        }
      }}
      onCancel={() => router.replace("/contacts")}
    />
  );
}
