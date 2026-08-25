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
import useKey from "@bciers/utils/src/useKey";
import {
  useValidationErrors,
  handleApiResponse,
} from "@bciers/components/validationErrors";

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
  const params = useParams();
  const role = useSessionRole();
  const [key, resetKey] = useKey();

  const [formState, setFormState] = useState<ContactFormData>(
    formData ?? ({} as ContactFormData),
  );
  const [isCreatingState, setIsCreatingState] = useState(Boolean(isCreating));
  const [modalOpen, setModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { setErrors, renderedErrors } = useValidationErrors();

  const hasPlacesAssigned = Boolean(
    formData.places_assigned && formData.places_assigned.length > 0,
  );

  const handleArchiveContact = async () => {
    setIsSubmitting(true);
    setErrors(undefined);

    const response = await archiveContact(params.contactId as string);
    setIsSubmitting(false);

    const isSuccess = handleApiResponse(response, setErrors);
    if (!isSuccess) {
      setModalOpen(false);
      return;
    }

    router.push("/contacts?from_deletion=true");
  };

  const handleSubmit = async (data: { formData?: any }) => {
    setErrors(undefined);
    const updatedFormData = { ...formState, ...data.formData };
    setFormState(updatedFormData);

    const method = isCreatingState ? "POST" : "PUT";
    const contactId = formState.id ?? params.contactId;
    const endpoint = isCreatingState
      ? "registration/contacts"
      : `registration/contacts/${contactId}`;
    const pathToRevalidate = isCreatingState
      ? "/contacts"
      : `/contacts/${contactId}`;

    const response = await actionHandler(endpoint, method, pathToRevalidate, {
      body: JSON.stringify(data.formData),
    });

    const isSuccess = handleApiResponse(response, setErrors);
    if (!isSuccess) {
      return { error: response.error };
    }

    const activeId = response.id ?? contactId;

    if (isCreatingState) {
      setIsCreatingState(false);
      setFormState((prev) => ({ ...prev, id: activeId }));
    } else {
      resetKey();
    }

    const titleQuery =
      `${response.first_name ?? ""} ${response.last_name ?? ""}`.trim();
    router.replace(`/contacts/${activeId}?contacts_title=${titleQuery}`);
  };

  return (
    <>
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

      <SingleStepTaskListForm
        key={key}
        errors={renderedErrors}
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
        handleDelete={() => setModalOpen(true)}
        deleteButtonText="Delete Contact"
        onSubmit={handleSubmit}
        onCancel={() => router.replace("/contacts")}
      />
    </>
  );
}
