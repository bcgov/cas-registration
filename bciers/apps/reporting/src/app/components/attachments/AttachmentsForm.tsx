"use client";
import { multiStepHeaderSteps } from "@reporting/src/app/components/taskList/multiStepHeaderConfig";
import { HasReportVersion } from "@reporting/src/app/utils/defaultPageFactoryTypes";
import postAttachments from "@reporting/src/app/utils/postAttachments";
import AttachmentElement, {
  AttachmentElementOptions,
} from "./AttachmentElement";
import { useState } from "react";
import { UploadedAttachment } from "./types";
import MultiStepWrapperWithTaskList from "@bciers/components/form/MultiStepWrapperWithTaskList";
import { useRouter } from "next/navigation";
import { NavigationInformation } from "../taskList/types";

interface Props extends HasReportVersion {
  initialUploadedAttachments: {
    [attachment_type: string]: UploadedAttachment;
  };
  navigationInformation: NavigationInformation;
  isVerificationStatementMandatory: boolean;
}

const AttachmentsForm: React.FC<Props> = ({
  version_id,
  navigationInformation,
  initialUploadedAttachments,
  isVerificationStatementMandatory,
}) => {
  const router = useRouter();

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
      if (canContinue) return router.push(navigationInformation.continueUrl);
      else return;
    }

    const formData = new FormData();
    setIsSaving(true);

    for (const [fileType, file] of Object.entries(pendingUploadFiles)) {
      formData.append("files", file);
      formData.append("file_types", fileType);
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
      <MultiStepWrapperWithTaskList
        steps={multiStepHeaderSteps}
        initialStep={4}
        taskListElements={navigationInformation.taskList}
        onSubmit={() => handleSubmit(true)}
        cancelUrl="#"
        backUrl={navigationInformation.backUrl}
        continueUrl={navigationInformation.continueUrl}
        errors={errors}
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
