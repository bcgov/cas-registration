"use client";
import { multiStepHeaderSteps } from "../taskList/multiStepHeaderConfig";
import { HasReportVersion } from "../../utils/defaultPageFactory";
import { getSignOffAndSubmitSteps } from "../taskList/5_signOffSubmit";
import postAttachments from "@bciers/actions/api/postAttachments";
import MultiStepWrapperWithTaskList from "./MultiStepWrapperWithTaskList";
import AttachmentElement from "./AttachmentElement";
import { useState } from "react";

interface Props extends HasReportVersion {}

const AttachmentsForm: React.FC<Props> = ({ version_id }) => {
  const taskListElements = getSignOffAndSubmitSteps(version_id);
  const [files, setFiles] = useState<{ [filename: string]: File }>({});

  const handleChange = (fileType: string, file: File | undefined) => {
    if (file) {
      setFiles({ ...files, [fileType]: file });
    } else {
      const { [fileType]: removed, ...prunedFiles } = files;
      setFiles(prunedFiles);
    }
  };

  const handleSubmit = async () => {
    console.log("Submit!", files);

    const formData = new FormData();
    for (const [fileType, file] of Object.entries(files)) {
      formData.append("files", file);
      formData.append("file_types", fileType);
    }

    await postAttachments(version_id, formData);
    console.log(formData);
  };

  return (
    <>
      <MultiStepWrapperWithTaskList
        steps={multiStepHeaderSteps}
        initialStep={4}
        taskListElements={taskListElements}
        onSubmit={handleSubmit}
        cancelUrl="#"
      >
        <p>
          Please upload any of the documents below that is applicable to your
          report:
        </p>
        <AttachmentElement
          title="Verification statement"
          onFileChange={(file) => handleChange("verification_statement", file)}
        />
        <AttachmentElement
          title="WCI.352 and WCI.362"
          onFileChange={(file) => handleChange("wci_352_362", file)}
        />
      </MultiStepWrapperWithTaskList>
    </>
  );
};

export default AttachmentsForm;
