"use client";
import { HasReportVersion } from "@reporting/src/app/utils/defaultPageFactoryTypes";
import postAttachments from "@reporting/src/app/utils/postAttachments";
import AttachmentElement, {
  AttachmentElementOptions,
} from "./AttachmentElement";
import { useState } from "react";
import { SupplementaryConfirmation, UploadedAttachment } from "./types";
import MultiStepWrapperWithTaskList from "@bciers/components/form/MultiStepWrapperWithTaskList";
import { useRouter } from "next/navigation";
import { NavigationInformation } from "../taskList/types";
import { getDictFromAttachmentArray } from "./AttachmentsPage";
import { Checkbox } from "@mui/material";

interface Props extends HasReportVersion {
  initialUploadedAttachments: {
    [attachment_type: string]: UploadedAttachment;
  };
  navigationInformation: NavigationInformation;
  isVerificationStatementMandatory: boolean;
  isSupplementaryReport: boolean;
  initialSupplementaryConfirmation?: SupplementaryConfirmation;
}

const AttachmentsForm: React.FC<Props> = ({
  version_id,
  navigationInformation,
  initialUploadedAttachments,
  isVerificationStatementMandatory,
  isSupplementaryReport,
  initialSupplementaryConfirmation,
}) => {
  const router = useRouter();

  // That information needs to be part of state for when the user saves
  const [uploadedAttachments, setUplodadedAttachments] = useState(
    initialUploadedAttachments,
  );
  // — supplementary confirmation state —
  const [
    confirmExistingAttachmentsRelevant,
    setConfirmExistingAttachmentsRelevant,
  ] = useState(
    Boolean(
      initialSupplementaryConfirmation?.confirm_supplementary_existing_attachments_relevant,
    ),
  );
  const [
    confirmRequiredAttachmentsUploaded,
    setConfirmRequiredAttachmentsUploaded,
  ] = useState(
    Boolean(
      initialSupplementaryConfirmation?.confirm_supplementary_required_attachments_uploaded,
    ),
  );
  const submitDisabled =
    isSupplementaryReport &&
    (!confirmExistingAttachmentsRelevant ||
      !confirmRequiredAttachmentsUploaded);

  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isRedirecting, setIsRedirecting] = useState<boolean>(false);

  const [errors, setErrors] = useState<string[]>();
  const [validationErrors, setValidationErrors] = useState<{
    [fileType: string]: string;
  }>({});
  const [pendingUploadFiles, setPendingUploadFiles] = useState<{
    [fileType: string]: File;
  }>({});

  const handleChange = (fileType: string, file: File | undefined) => {
    if (file) {
      setPendingUploadFiles({ ...pendingUploadFiles, [fileType]: file });
    } else {
      const { [fileType]: removed, ...prunedFiles } = pendingUploadFiles;
      setPendingUploadFiles(prunedFiles);
    }
  };

  //
  const validateAttachments = () => {
    if (
      isVerificationStatementMandatory &&
      !(
        "verification_statement" in pendingUploadFiles ||
        "verification_statement" in uploadedAttachments
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

  const handleSubmit = async (canContinue: boolean) => {
    if (!isSupplementaryReport && !validateAttachments()) return;

    if (
      !isSupplementaryReport &&
      Object.keys(pendingUploadFiles).length === 0
    ) {
      // Nothing to submit
      if (canContinue) return router.push(navigationInformation.continueUrl);
      else return;
    }

    const formData = new FormData();
    setIsSaving(true);

    for (const [fileType, file] of Object.entries(pendingUploadFiles)) {
      formData.append("files", file);
      formData.append("file_types", fileType);
    }
    if (isSupplementaryReport) {
      formData.append(
        "confirm_supplementary_required_attachments_uploaded",
        confirmRequiredAttachmentsUploaded ? "true" : "false",
      );
      formData.append(
        "confirm_supplementary_existing_attachments_relevant",
        confirmExistingAttachmentsRelevant ? "true" : "false",
      );
    }
    const response = await postAttachments(version_id, formData);

    if (response.error) {
      setErrors([response.error]);
    } else {
      setPendingUploadFiles({});
      setUplodadedAttachments(getDictFromAttachmentArray(response.attachments));

      if (canContinue) {
        setIsRedirecting(true);
        router.push(navigationInformation.continueUrl);
      }
    }

    setIsSaving(false);
  };

  // Returns the id of the file if it has been saved,
  // or underfined if the user changed that file.
  const getFileId = (fileType: string) => {
    return Object.keys(pendingUploadFiles).includes(fileType)
      ? undefined
      : uploadedAttachments && uploadedAttachments[fileType]?.id;
  };

  // Returns the name of the file
  const getFileName = (fileType: string) => {
    return Object.keys(pendingUploadFiles).includes(fileType)
      ? pendingUploadFiles[fileType].name
      : uploadedAttachments && uploadedAttachments[fileType]?.attachment_name;
  };

  const buildAttachmentElement = (
    title: string,
    fileType: string,
    extraProps?: AttachmentElementOptions,
  ) => (
    <AttachmentElement
      versionId={version_id}
      title={title}
      onFileChange={(file) => handleChange(fileType, file)}
      fileId={getFileId(fileType)}
      fileName={getFileName(fileType)}
      isUploading={isSaving}
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
        noFormSave={() => handleSubmit(false)}
        submitButtonDisabled={submitDisabled}
      >
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
        </ul>{" "}
        {isSupplementaryReport && (
          <div className="mt-4 border-t pt-4">
            <p>
              Before clicking &apos;Save & Continue&apos;, please confirm that
              you understand and agree with the following statements:
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
