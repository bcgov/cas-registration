"use client";

import { useState } from "react";
import TaskListForm from "@bciers/components/form/TaskListForm";
import { ContactFormData } from "./types";
import {
  FormMode,
  FrontEndRoles,
  FrontendMessages,
} from "@bciers/utils/src/enums";
import SnackBar from "@bciers/components/form/components/SnackBar";
import { contactsUiSchema } from "@/administration/app/data/jsonSchema/contact";
import Link from "next/link";
import SimpleModal from "@bciers/components/modal/SimpleModal";
import { archiveContact } from "@bciers/actions/api";
import { useParams, useRouter } from "next/navigation";
import { useSessionRole } from "@bciers/utils/src/sessionUtils";
import { actionHandler } from "@bciers/actions";
import useKey from "@bciers/utils/src/useKey";

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
  const [key, resetKey] = useKey();
  const role = useSessionRole();
  const [modalOpen, setModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSnackbarOpen, setIsSnackbarOpen] = useState(false);
  const params = useParams();

  const handleClickDelete = () => {
    setModalOpen(true);
  };

  const handleArchiveContact = async () => {
    setIsSubmitting(true);
    // Not the route param: after creating a contact the URL is rewritten with
    // history.replaceState, so useParams() still reports the add-contact route
    const response = await archiveContact(
      String(formState.id ?? params.contactId),
    );
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
      {/* Sits outside TaskListForm so that resetKey() doesn't unmount it on save */}
      <SnackBar
        isSnackbarOpen={isSnackbarOpen}
        setIsSnackbarOpen={setIsSnackbarOpen}
        message={FrontendMessages.SUBMIT_CONFIRMATION}
      />
      <SimpleModal
        title="Confirmation"
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onConfirm={handleArchiveContact}
        confirmText="Delete Contact"
        cancelText={hasPlacesAssigned ? "Back" : "Cancel"}
        showConfirmButton={!hasPlacesAssigned}
        isSubmitting={isSubmitting}
      >
        {hasPlacesAssigned
          ? "Before you can delete this contact, please remove them from the places they are assigned. If they are the only one assigned, you must replace them with another contact in the assigned place."
          : "Please confirm that you would like to delete this contact."}
      </SimpleModal>
      <TaskListForm
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

          setIsSnackbarOpen(true);

          if (isCreatingState) {
            setIsCreatingState(false);
            setFormState((prevState) => ({
              ...prevState,
              id: response.id,
            }));
          } else {
            resetKey();
          }
          const replaceUrl = `/contacts/${
            method === "POST" ? response.id : formState.id
          }?contacts_title=${response.first_name} ${response.last_name}`;
          // Rewrite the URL in place. router.replace() re-suspends the page's Suspense
          // boundary (see defaultPageFactory), which swaps the form for a loading
          // skeleton and unmounts the success message along with it.
          window.history.replaceState(null, "", `/administration${replaceUrl}`);
        }}
        onCancel={() => router.replace("/contacts")}
      />
    </>
  );
}
