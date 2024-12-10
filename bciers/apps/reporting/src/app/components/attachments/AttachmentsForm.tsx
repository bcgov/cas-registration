"use client";
import { multiStepHeaderSteps } from "../taskList/multiStepHeaderConfig";
import { HasReportVersion } from "../../utils/defaultPageFactoryTypes";
import postAttachments from "@reporting/src/app/utils/postAttachments";
import AttachmentElement from "./AttachmentElement";
import { useEffect, useState } from "react";
import { UploadedAttachment } from "./types";
import { TaskListElement } from "@bciers/components/navigation/reportingTaskList/types";
import MultiStepWrapperWithTaskList from "@bciers/components/form/MultiStepWrapperWithTaskList";
import { useRouter } from "next/navigation";

interface Props extends HasReportVersion {
  initialUploadedAttachments: {
    [attachment_type: string]: UploadedAttachment;
  };
  taskListElements: TaskListElement[];
}

const AttachmentsForm: React.FC<Props> = ({
  version_id,
  taskListElements,
  initialUploadedAttachments,
}) => {
  const router = useRouter();
  const saveAndContinueUrl = `/reports/${version_id}/final-review`;
  const backURL = `/reports/${version_id}/verification`;

  const [canContinue, setCanContinue] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isRedirecting, setIsRedirecting] = useState<boolean>(false);

  const [error, setError] = useState<string>();
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

  const handleSubmit = async () => {
    // Nothing to submit
    if (Object.keys(pendingUploadFiles).length === 0) {
      if (canContinue) router.push(saveAndContinueUrl);
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

  const buildAttachmentElement = (title: string, fileType: string) => (
    <AttachmentElement
      title={title}
      onFileChange={(file) => handleChange(fileType, file)}
      fileId={getFileId(fileType)}
      fileName={getFileName(fileType)}
    />
  );

  const submitExternallyToContinue = () => {
    setCanContinue(true);
  }; // Only submit after canContinue is set so the submitHandler can read the boolean
  useEffect(() => {
    if (canContinue) {
      handleSubmit();
    }
  }, [canContinue]);

  return (
    <>
      <MultiStepWrapperWithTaskList
        steps={multiStepHeaderSteps}
        initialStep={4}
        taskListElements={taskListElements}
        onSubmit={submitExternallyToContinue}
        cancelUrl="#"
        backUrl={backURL}
        continueUrl={saveAndContinueUrl}
        error={error}
        isSaving={isSaving}
        isRedirecting={isRedirecting}
        noFormSave={handleSubmit}
      >
        <p>
          Please upload any of the documents below that is applicable to your
          report:
        </p>
        {buildAttachmentElement(
          "Verification Statement",
          "verification_statement",
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
