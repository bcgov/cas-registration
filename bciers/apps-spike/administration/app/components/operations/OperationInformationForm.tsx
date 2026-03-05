"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import useKey from "@bciers/utils/src/useKey";

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
import {
  FormMode,
  FrontEndRoles,
  OperationTypes,
} from "@bciers/utils/src/enums";
import { useSessionRole } from "@bciers/utils/src/sessionUtils";
import Note from "@bciers/components/layout/Note";
import Link from "next/link";
import ConfirmChangeOfFieldModal from "@/registration/app/components/operations/registration/ConfirmChangeOfFieldModal";

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
  const [confirmedFormData, setConfirmedFormData] = useState(formData);
  const [
    pendingChangeRegistrationPurpose,
    setPendingChangeRegistrationPurpose,
  ] = useState("");
  const [isConfirmPurposeChangeModalOpen, setIsConfirmPurposeChangeModalOpen] =
    useState<boolean>(false);
  const [key, resetKey] = useKey();
  const [formMode, setFormMode] = useState(FormMode.READ_ONLY);

  const router = useRouter();
  // To get the user's role from the session
  const role = useSessionRole();
  const searchParams = useSearchParams();
  const isRedirectedFromContacts = searchParams.get("from_contacts") as string;

  function checkMissingRepresentative(data: any) {
    if (data && data.status && data.registration_purpose) {
      return (
        data.status === "Registered" &&
        (!data.operation_representatives ||
          data.operation_representatives.length === 0)
      );
    } else return false;
  }
  const [isMissingRepresentative, setIsMissingRepresentative] = useState(
    checkMissingRepresentative(formData),
  );

  const updateConfirmedFormData = (newPurpose: string) => {
    const isEio =
      newPurpose === RegistrationPurposes.ELECTRICITY_IMPORT_OPERATION;
    const newFormData = {
      ...confirmedFormData,
      registration_purpose: newPurpose,
      // When switching to EIO, set the type to EIO since that's the only valid option
      ...(isEio && { type: OperationTypes.EIO }),
    };
    setConfirmedFormData(newFormData);

    if (isEio) {
      setSchema(eioSchema);
    } else {
      setSchema(generalSchema);
    }
  };

  const handleSubmit = async (data: {
    formData?: OperationInformationFormData;
  }) => {
    setError(undefined);
    const pathToRevalidate = `/operations/${operationId}`;
    const response = await actionHandler(
      `registration/operations/${operationId}`,
      "PUT",
      pathToRevalidate,
      {
        body: JSON.stringify(data.formData),
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
      pathToRevalidate,
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
    setFormMode(FormMode.EDIT); // Keep form in edit mode after remount
    resetKey();
    setIsConfirmPurposeChangeModalOpen(false);
  };

  const confirmRegistrationPurposeChange = () => {
    if (pendingChangeRegistrationPurpose !== "") {
      updateConfirmedFormData(pendingChangeRegistrationPurpose);
      setFormMode(FormMode.EDIT); // Keep form in edit mode after remount
      resetKey();
      setIsConfirmPurposeChangeModalOpen(false);
    }
    setPendingChangeRegistrationPurpose("");
  };

  const handleSelectedPurposeChange = (newSelectedPurpose: string) => {
    if (newSelectedPurpose && confirmedFormData.registration_purpose) {
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
      <ConfirmChangeOfFieldModal
        open={isConfirmPurposeChangeModalOpen}
        onCancel={cancelRegistrationPurposeChange}
        onConfirm={confirmRegistrationPurposeChange}
        modalText={
          <>
            <div>
              Are you sure you want to change your registration purpose?
            </div>
            <ul className="list-disc pl-5 mt-2">
              <li>
                Some operation information you have entered will be deleted.
              </li>
              <li>
                If this operation’s report is in progress, it will be deleted
                and restarted.
              </li>
            </ul>
          </>
        }
        confirmButtonText="Change registration purpose"
      />
      <SingleStepTaskListForm
        key={key}
        allowEdit={!role.includes("cas_")}
        mode={formMode}
        error={error}
        schema={schema}
        uiSchema={administrationOperationInformationUiSchema}
        formData={confirmedFormData ?? {}}
        onSubmit={handleSubmit}
        onChange={(e: IChangeEvent) => {
          const newSelectedPurpose = e.formData?.section3?.registration_purpose;
          if (newSelectedPurpose !== confirmedFormData.registration_purpose) {
            handleSelectedPurposeChange(newSelectedPurpose);
          }
          setIsMissingRepresentative(checkMissingRepresentative(e.formData));
        }}
        onCancel={() => router.push("/operations")}
        formContext={{
          operationId,
          isRegulatedOperation: regulatedOperationPurposes.includes(
            confirmedFormData.registration_purpose as RegistrationPurposes,
          ),
          isOptedOut:
            formData.opted_in_operation?.final_reporting_year !== null,
          isCasDirector: role === FrontEndRoles.CAS_DIRECTOR,
          isEio: confirmedFormData.registration_purpose?.match(
            RegistrationPurposes.ELECTRICITY_IMPORT_OPERATION.valueOf(),
          ),
          status: confirmedFormData.status,
          missing_representative_alert: isMissingRepresentative,
        }}
      />
    </>
  );
};

export default OperationInformationForm;
