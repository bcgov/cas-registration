"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { UUID } from "crypto";
import SingleStepTaskListForm from "@bciers/components/form/SingleStepTaskListForm";
import { RJSFSchema } from "@rjsf/utils";
import { IChangeEvent } from "@rjsf/core";
import { administrationOperationInformationUiSchema } from "../../data/jsonSchema/operationInformation/administrationOperationInformation";
import {
  OperationInformationFormData,
  OperationInformationPartialFormData,
} from "./types";
import { actionHandler } from "@bciers/actions";
import {
  RegistrationPurposes,
  regulatedOperationPurposes,
} from "apps/registration/app/components/operations/registration/enums";
import { FormMode, FrontEndRoles } from "@bciers/utils/src/enums";
import { useSessionRole } from "@bciers/utils/src/sessionUtils";
import Note from "@bciers/components/layout/Note";
import Link from "next/link";
import ConfirmChangeOfRegistrationPurposeModal from "@/registration/app/components/operations/registration/ConfirmChangeOfRegistrationPurposeModal";

// could change the page out of an rjsf form to just a regular form
// use rjsf to render everything but submission isn't via rjsf--we grab the formdata from rjsf and make our own formdata
const OperationInformationForm = ({
  formData,
  operationId,
  schema: initialSchema,
  eioSchema,
  generalSchema,
}: {
  formData: OperationInformationPartialFormData;
  operationId: UUID;
  schema: RJSFSchema;
  eioSchema: RJSFSchema;
  generalSchema: RJSFSchema;
}) => {
  const [error, setError] = useState(undefined);
  const [schema, setSchema] = useState(initialSchema);
  const [selectedPurpose, setSelectedPurpose] = useState(
    formData.registration_purpose || "",
  );
  const [
    pendingChangeRegistrationPurpose,
    setPendingChangeRegistrationPurpose,
  ] = useState("");
  const [isConfirmPurposeChangeModalOpen, setIsConfirmPurposeChangeModalOpen] =
    useState<boolean>(false);
  const router = useRouter();
  // To get the user's role from the session
  const role = useSessionRole();
  const searchParams = useSearchParams();
  const isRedirectedFromContacts = searchParams.get("from_contacts") as string;

  useEffect(() => {
    if (selectedPurpose) {
      formData.registration_purpose = selectedPurpose;
    }
    if (selectedPurpose === RegistrationPurposes.ELECTRICITY_IMPORT_OPERATION) {
      setSchema(eioSchema);
    } else {
      setSchema(generalSchema);
    }
  }, [selectedPurpose, eioSchema, generalSchema]);

  const handleSubmit = async (data: {
    formData?: OperationInformationFormData;
  }) => {
    console.log("formData", formData);
    const trueFormData = new FormData();
    trueFormData.append("boundary_map", formData.boundary_map);

    setError(undefined);
    const response = await actionHandler(
      `registration/operations/${operationId}`,
      "PUT",
      "",
      {
        // brianna instead of doing this, the body could be FormData type
        // build a form data object hefIre in handlesubmit, iterate over the keys like line 83 in AttachmentsForm, FormData can handle real file objects. Saves us from having to parse/load the dataurl on the server. getting download working isn't a big lift. see how many 20MB files we can upload at the same time in load testing. Might be some django ninja stuff to do
        body: trueFormData,
      },
    );

    if (response?.error) {
      // Users get this error when they select a contact that's missing address information. We include a link to the Contacts page because the user has to fix the error from there, not here in the operation form.
      if (response.error.includes("Please return to Contacts")) {
        const splitError = response.error.split("Contacts");
        response.error = (
          <>
            {splitError[0]} <Link href={"/contacts"}>Contacts</Link>
            {splitError[1]}
          </>
        );
      }
      setError(response.error);
      return { error: response.error };
    }

    if (!data.formData?.opted_in_operation) return;
    const response2 = await actionHandler(
      `registration/operations/${operationId}/registration/opted-in-operation-detail`,
      "PUT",
      "",
      {
        body: JSON.stringify(data.formData?.opted_in_operation),
      },
    );

    if (response2?.error) {
      setError(response2.error);
      return { error: response2.error };
    }
  };

  const cancelRegistrationPurposeChange = () => {
    setPendingChangeRegistrationPurpose("");
    setIsConfirmPurposeChangeModalOpen(false);
  };

  const confirmRegistrationPurposeChange = () => {
    if (pendingChangeRegistrationPurpose !== "") {
      setSelectedPurpose(pendingChangeRegistrationPurpose);
      setIsConfirmPurposeChangeModalOpen(false);
    }
    formData.registration_purpose = pendingChangeRegistrationPurpose;
    setPendingChangeRegistrationPurpose("");
  };

  const handleSelectedPurposeChange = (newSelectedPurpose: string) => {
    if (newSelectedPurpose && selectedPurpose) {
      setIsConfirmPurposeChangeModalOpen(true);
      setPendingChangeRegistrationPurpose(newSelectedPurpose);
    }
  };

  return (
    <>
      {isRedirectedFromContacts && !role.includes("cas_") && (
        <Note variant="important">
          To remove the current operation representative, please select a new
          contact to replace them.
        </Note>
      )}
      <ConfirmChangeOfRegistrationPurposeModal
        open={isConfirmPurposeChangeModalOpen}
        cancelRegistrationPurposeChange={cancelRegistrationPurposeChange}
        confirmRegistrationPurposeChange={confirmRegistrationPurposeChange}
      />
      <SingleStepTaskListForm
        allowEdit={!role.includes("cas_")}
        mode={FormMode.READ_ONLY}
        error={error}
        schema={schema}
        uiSchema={administrationOperationInformationUiSchema}
        formData={formData ?? {}}
        onSubmit={handleSubmit}
        onChange={(e: IChangeEvent) => {
          let newSelectedPurpose = e.formData?.section3?.registration_purpose;
          if (newSelectedPurpose !== selectedPurpose) {
            handleSelectedPurposeChange(newSelectedPurpose);
          }
        }}
        onCancel={() => router.push("/operations")}
        // customValidate={customValidate}
        formContext={{
          operationId,
          isRegulatedOperation: regulatedOperationPurposes.includes(
            formData.registration_purpose as RegistrationPurposes,
          ),
          isCasDirector: role === FrontEndRoles.CAS_DIRECTOR,
          isEio: formData.registration_purpose?.match(
            RegistrationPurposes.ELECTRICITY_IMPORT_OPERATION.valueOf(),
          ),
          status: formData.status,
        }}
      />
    </>
  );
};

export default OperationInformationForm;
