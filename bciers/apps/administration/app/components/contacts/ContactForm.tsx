"use client";

import { useState } from "react";
import SingleStepTaskListForm from "@bciers/components/form/SingleStepTaskListForm";
import { ContactFormData } from "./types";
import { FormMode, FrontEndRoles } from "@bciers/utils/src/enums";
import { contactsUiSchema } from "@/administration/app/data/jsonSchema/contact";
import Link from "next/link";
import SimpleModal from "@bciers/components/modal/SimpleModal";
import { archiveContact } from "@bciers/actions/api";
import { useParams, useRouter } from "next/navigation";
import { useSessionRole } from "@bciers/utils/src/sessionUtils";
import { actionHandler } from "@bciers/actions";

interface Props {
  schema: any;
  formData: ContactFormData;
  isCreating?: boolean;
  allowEdit?: boolean;
}

const NewOperationMessage = () => (
  <>
    <b>Note: </b>You can assign this representative to an operation directly in
    the Operation Information form. To do so, go to the{" "}
    <Link href={"/operations"}>Operations page</Link>, select an operation, and
    go to the Operation Information form.
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
  const [modalOpen, setModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const params = useParams();

  const handleClickDelete = () => {
    setModalOpen(true);
  };

  const handleArchiveContact = async () => {
    setIsSubmitting(true);
    const response = await archiveContact(params.contactId as string);
    if (response?.error) {
      setError(response.error as any);
      setModalOpen(false);
      setIsSubmitting(false);
      return;
    }
    router.push("/contacts?from_deletion=true");
    return;
  };

  const hasPlacesAssigned =
    formData.places_assigned && formData.places_assigned.length > 0;

  return (
    <>
      <SimpleModal
        title="Confirmation"
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onConfirm={handleArchiveContact}
        confirmText="Delete Contact"
        cancelText={hasPlacesAssigned ? "Cancel" : "Back"}
        showConfirmButton={!hasPlacesAssigned}
        isSubmitting={isSubmitting}
      >
        {hasPlacesAssigned
          ? "Before you can delete this contact, please replace them in the places they are assigned with another contact first."
          : "Please confirm that you would like to delete this contact."}
      </SimpleModal>
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
        showDeleteButton={
          !isCreatingState && role === FrontEndRoles.INDUSTRY_USER_ADMIN
        }
        handleDelete={handleClickDelete}
        deleteButtonText="Delete Contact"
        onSubmit={async (data: { formData?: any }) => {
          setError(undefined);
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
    </>
  );
}
