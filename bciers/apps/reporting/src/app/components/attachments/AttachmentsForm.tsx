"use client";
import { multiStepHeaderSteps } from "@reporting/src/app/components/taskList/multiStepHeaderConfig";
import { HasReportVersion } from "@reporting/src/app/utils/defaultPageFactoryTypes";
import postAttachments from "@reporting/src/app/utils/postAttachments";
import AttachmentElement, {
  AttachmentElementOptions,
} from "./AttachmentElement";
import { useState } from "react";
import { UploadedAttachment } from "./types";
import { TaskListElement } from "@bciers/components/navigation/reportingTaskList/types";
import MultiStepWrapperWithTaskList from "@bciers/components/form/MultiStepWrapperWithTaskList";
import { useRouter } from "next/navigation";

interface Props extends HasReportVersion {
  initialUploadedAttachments: {
    [attachment_type: string]: UploadedAttachment;
  };
  taskListElements: TaskListElement[];
  isVerificationStatementMandatory: boolean;
}

const AttachmentsForm: React.FC<Props> = ({
  version_id,
  taskListElements,
  initialUploadedAttachments,
  isVerificationStatementMandatory,
}) => {
  const router = useRouter();
  const saveAndContinueUrl = `/reports/${version_id}/sign-off`;
  const backUrl = `/reports/${version_id}/verification`;

  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isRedirecting, setIsRedirecting] = useState<boolean>(false);

  const [error, setError] = useState<string>();
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
        "verification_statement" in initialUploadedAttachments
      )
    ) {
      setValidationErrors({
        verification_statement: "Must be present",
      });
      return false;
    } else {
      setValidationErrors({});
      return true;
    }
  };

  const handleSubmit = async (canContinue: boolean) => {
    if (!validateAttachments()) return;

    if (Object.keys(pendingUploadFiles).length === 0) {
      // Nothing to submit
      if (canContinue) router.push(saveAndContinueUrl);
      else return;
    }
    // brianna django ninja knows what to do with FormData
    const formData = new FormData();
    setIsSaving(true);

    for (const [fileType, file] of Object.entries(pendingUploadFiles)) {
      formData.append("files", file);
      formData.append("file_types", fileType);
    }

    const response = await postAttachments(version_id, formData);

    if (response.error) {
      setError(response.error);
    }

    if (canContinue) {
      setIsRedirecting(true);
      router.push(saveAndContinueUrl);
    }
    setIsSaving(false);
  };

  // Returns the id of the file if it has been saved,
  // or underfined if the user changed that file.
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
      {/* brianna is this a form */}
      <MultiStepWrapperWithTaskList
        steps={multiStepHeaderSteps}
        initialStep={4}
        taskListElements={taskListElements}
        onSubmit={() => handleSubmit(true)}
        cancelUrl="#"
        backUrl={backUrl}
        continueUrl={saveAndContinueUrl}
        error={error}
        isSaving={isSaving}
        isRedirecting={isRedirecting}
        noFormSave={() => handleSubmit(false)}
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
        </ul>
      </MultiStepWrapperWithTaskList>
    </>
  );
};

export default AttachmentsForm;
