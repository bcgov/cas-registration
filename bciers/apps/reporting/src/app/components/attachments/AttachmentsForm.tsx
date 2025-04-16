"use client";
import { HasReportVersion } from "@reporting/src/app/utils/defaultPageFactoryTypes";
import postAttachments from "@reporting/src/app/utils/postAttachments";
import { useEffect, useState } from "react";
import { UploadedAttachment } from "./types";
import MultiStepWrapperWithTaskList from "@bciers/components/form/MultiStepWrapperWithTaskList";
import { useRouter } from "next/navigation";
import { NavigationInformation } from "../taskList/types";
import { Checkbox } from "@mui/material";
import Alert from "@mui/material/Alert";
import AlertIcon from "@bciers/components/icons/AlertIcon";
import AttachmentElement, {
  AttachmentElementOptions,
} from "./AttachmentElement";

interface Props extends HasReportVersion {
  initialUploadedAttachments: {
    [attachment_type: string]: UploadedAttachment;
  };
  navigationInformation: NavigationInformation;
  isVerificationStatementMandatory: boolean;
  isSupplementaryReport: boolean;
}

const AttachmentsForm: React.FC<Props> = ({
  version_id,
  navigationInformation,
  initialUploadedAttachments,
  isVerificationStatementMandatory,
  isSupplementaryReport,
}) => {
  const router = useRouter();

  // State variables to manage form submission and validation
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isRedirecting, setIsRedirecting] = useState<boolean>(false);
  const [errors, setErrors] = useState<string[]>();
  const [validationErrors, setValidationErrors] = useState<{
    [fileType: string]: string;
  }>({});
  const [pendingUploadFiles, setPendingUploadFiles] = useState<{
    [fileType: string]: File;
  }>({});

  // State variables for supplementary report confirmations
  const [
    confirmExistingAttachmentsRelevant,
    setConfirmExistingAttachmentsRelevant,
  ] = useState(false);
  const [
    confirmRequiredAttachmentsUploaded,
    setConfirmRequiredAttachmentsUploaded,
  ] = useState(false);

  // Function to check if the verification statement is valid
  const isVerificationStatementValid = () => {
    return (
      !isVerificationStatementMandatory ||
      "verification_statement" in pendingUploadFiles ||
      "verification_statement" in initialUploadedAttachments
    );
  };

  // Function to determine if the submit button should be disabled
  const isInitialSubmitButtonDisabled = () => {
    return (
      (isVerificationStatementMandatory &&
        !("verification_statement" in initialUploadedAttachments)) ||
      (isSupplementaryReport &&
        (!confirmExistingAttachmentsRelevant ||
          !confirmRequiredAttachmentsUploaded))
    );
  };

  const [submitButtonDisabled, setSubmitButtonDisabled] = useState(
    isInitialSubmitButtonDisabled(),
  );

  // Effect hook to update submit button state based on form conditions
  useEffect(() => {
    const shouldDisable =
      (isVerificationStatementMandatory && !isVerificationStatementValid()) ||
      (isSupplementaryReport &&
        (!confirmExistingAttachmentsRelevant ||
          !confirmRequiredAttachmentsUploaded));

    setSubmitButtonDisabled(shouldDisable);
  }, [
    isVerificationStatementMandatory,
    pendingUploadFiles,
    initialUploadedAttachments,
    isSupplementaryReport,
    confirmExistingAttachmentsRelevant,
    confirmRequiredAttachmentsUploaded,
  ]);

  // Function to validate attachments before submission
  const validateAttachments = () => {
    if (
      isVerificationStatementMandatory &&
      !(
        "verification_statement" in pendingUploadFiles ||
        "verification_statement" in initialUploadedAttachments
      )
    ) {
      setValidationErrors({
        verification_statement: "Verification statement is required",
      });
      return false;
    } else {
      setValidationErrors({});
      return true;
    }
  };

  // Function to handle file changes in the form
  const handleChange = (fileType: string, file: File | undefined) => {
    if (file) {
      setPendingUploadFiles({ ...pendingUploadFiles, [fileType]: file });
    } else {
      const { [fileType]: removed, ...prunedFiles } = pendingUploadFiles;
      setPendingUploadFiles(prunedFiles);
    }
  };

  // Function to handle form submission
  const handleSubmit = async (canContinue: boolean) => {
    if (!validateAttachments()) return;

    if (Object.keys(pendingUploadFiles).length === 0) {
      // Nothing to submit
      if (canContinue) return router.push(navigationInformation.continueUrl);
      else return;
    }

    const formData = new FormData();
    setIsSaving(true);

    // Append files to form data
    for (const [fileType, file] of Object.entries(pendingUploadFiles)) {
      formData.append("files", file);
      formData.append("file_types", fileType);
    }
    // Append checkbox values if it's a supplementary report
    if (isSupplementaryReport) {
      formData.append(
        "confirm_existing_attachments_relevant",
        confirmExistingAttachmentsRelevant ? "true" : "false",
      );
      formData.append(
        "confirm_required_attachments_uploaded",
        confirmRequiredAttachmentsUploaded ? "true" : "false",
      );
    }

    const response = await postAttachments(version_id, formData);

    if (response.error) {
      setErrors([response.error]);
    } else {
      if (canContinue) {
        setIsRedirecting(true);
        router.push(navigationInformation.continueUrl);
      }
    }

    setIsSaving(false);
  };

  // Returns the id of the file if it has been saved,
  // or undefined if the user changed that file.
  const getFileId = (fileType: string) => {
    return Object.keys(pendingUploadFiles).includes(fileType)
      ? undefined
      : initialUploadedAttachments[fileType]?.id;
  };

  // Returns the name of the file
  const getFileName = (fileType: string) => {
    return Object.keys(pendingUploadFiles).includes(fileType)
      ? pendingUploadFiles[fileType].name
      : initialUploadedAttachments[fileType]?.attachment_name;
  };

  // Function to build an attachment element with optional props
  const buildAttachmentElement = (
    title: string,
    fileType: string,
    extraProps?: AttachmentElementOptions,
  ) => (
    <AttachmentElement
      title={title}
      onFileChange={(file) => handleChange(fileType, file)}
      fileId={getFileId(fileType)}
      fileName={getFileName(fileType)}
      {...(extraProps || {})}
    />
  );

  return (
    <>
      <MultiStepWrapperWithTaskList
        steps={navigationInformation.headerSteps}
        initialStep={navigationInformation.headerStepIndex}
        taskListElements={navigationInformation.taskList}
        onSubmit={() => handleSubmit(true)}
        cancelUrl="#"
        backUrl={navigationInformation.backUrl}
        continueUrl={navigationInformation.continueUrl}
        errors={errors}
        isSaving={isSaving}
        isRedirecting={isRedirecting}
        submitButtonDisabled={submitButtonDisabled}
        noFormSave={() => handleSubmit(false)}
      >
        {isSupplementaryReport && (
          <Alert severity="warning" icon={<AlertIcon fill="#635231" />}>
            Review your attachments and replace any that are no longer
            applicable to this report.
          </Alert>
        )}
        <p>
          Please upload any of the documents below that is applicable to your
          report:
        </p>
        {buildAttachmentElement(
          "Verification Statement",
          "verification_statement",
          {
            required: isVerificationStatementMandatory,
            error: validationErrors.verification_statement,
          },
        )}
        {buildAttachmentElement("WCI.352 and WCI.362", "wci_352_362")}
        {buildAttachmentElement(
          "Additional reportable information",
          "additional_reportable_information",
        )}
        {buildAttachmentElement(
          "Confidentiality request, if you are requesting confidentiality of this report under the B.C. Reg. 249/2015 Reporting Regulation",
          "confidentiality_request",
        )}
        <p>
          <b>Note:</b>
        </p>
        <ul>
          <li>
            An operator may claim that disclosure of the information referred to
            in Section 44(2)(a) to (d) be prohibited under Section 21 of the
            Freedom of Information and Protection of Privacy Act (FOIPPA) and
            request that the information be kept confidential
          </li>
          <li>
            A claim must be done in accordance with Section 44(5) of the
            Regulation
          </li>
          <li>
            The Director under GGIRCA will be in contact with you regarding your
            request
          </li>
        </ul>
        {isSupplementaryReport && (
          <div className="mt-4 border-t pt-4">
            <p>
              Before clicking 'Continue’, please confirm that you understand and
              agree with the following statements:
            </p>
            <div className="flex items-start mt-3">
              <Checkbox
                checked={confirmExistingAttachmentsRelevant}
                onChange={(e) =>
                  setConfirmExistingAttachmentsRelevant(e.target.checked)
                }
                inputProps={{
                  "aria-labelledby":
                    "confirm-existing-attachments-relevant-label",
                }}
              />
              <label
                id="confirm-existing-attachments-relevant-label"
                className="ml-2"
              >
                I confirm that I have uploaded any attachments that are required
                to be updated for the new submission of this report.
              </label>
            </div>

            <div className="flex items-start mt-3">
              <Checkbox
                checked={confirmRequiredAttachmentsUploaded}
                onChange={(e) =>
                  setConfirmRequiredAttachmentsUploaded(e.target.checked)
                }
                inputProps={{
                  "aria-labelledby":
                    "confirm-required-attachments-uploaded-label",
                }}
              />
              <label
                id="confirm-required-attachments-uploaded-label"
                className="ml-2"
              >
                I confirm that any previously uploaded attachments that have not
                been updated are still relevant to the new submission of this
                report.
              </label>
            </div>
          </div>
        )}
      </MultiStepWrapperWithTaskList>
    </>
  );
};

export default AttachmentsForm;
