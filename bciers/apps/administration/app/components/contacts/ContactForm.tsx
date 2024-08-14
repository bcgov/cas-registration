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
  const [isCreatingState, setIsCreatingState] = useState(isCreating);
  const [key, setKey] = useState(Math.random());
  const [selectedUser, setSelectedUser] = useState("");

  const handleSelectUserChange = async (userId: UUID) => {
    try {
      setSelectedUser(userId);
      const userData: ContactFormData = await getUserData(userId);
      setFormState(userData);
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
      mode={isCreatingState ? FormMode.CREATE : FormMode.READ_ONLY}
      allowEdit={allowEdit}
      inlineMessage={isCreatingState && <NewOperationMessage />}
      onSubmit={async (data: { formData?: any }) => {
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
        } else {
          // Update formState with the new ID from the response
          const updatedFormState = {
            ...formState, // Retain the current form state
            ...data.formData, // Merge in the form data
            id: response.id, // add the id from the response
          };
          // Set the updated form state
          setFormState(updatedFormState);
        }

        if (isCreatingState) {
          setIsCreatingState(false);
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
          handleSelectUserChange(e.formData.section1.selected_user);
        }
      }}
      onCancel={() => router.replace("/contacts")}
    />
  );
}
