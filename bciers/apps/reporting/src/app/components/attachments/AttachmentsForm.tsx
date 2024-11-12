"use client";
import { multiStepHeaderSteps } from "../taskList/multiStepHeaderConfig";
import { HasReportVersion } from "../../utils/defaultPageFactory";
import { getSignOffAndSubmitSteps } from "../taskList/5_signOffSubmit";
import postAttachments from "@bciers/actions/api/postAttachments";
import MultiStepWrapperWithTaskList from "./MultiStepWrapperWithTaskList";
import AttachmentElement from "./AttachmentElement";

interface Props extends HasReportVersion {}

const AttachmentsForm: React.FC<Props> = ({ version_id }) => {
  const taskListElements = getSignOffAndSubmitSteps(version_id);

  const handleSubmit = async (data: any) => {
    await postAttachments(version_id, data.formData);
  };

  return (
    <>
      <MultiStepWrapperWithTaskList
        steps={multiStepHeaderSteps}
        initialStep={4}
        taskListElements={taskListElements}
      >
        <AttachmentElement
          title="Test field"
          value="Abc.pdf"
          onFileChange={() => {}}
        />
      </MultiStepWrapperWithTaskList>
    </>
  );
};

export default AttachmentsForm;
