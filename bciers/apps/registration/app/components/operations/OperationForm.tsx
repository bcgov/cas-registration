"use client";

import SingleStepTaskListForm from "@bciers/components/form/SingleStepTaskListForm";
import { RJSFSchema } from "@rjsf/utils";
import { operationUiSchema } from "./operation";

const OperationForm = ({ schema }: { schema: RJSFSchema }) => {
  return (
    <SingleStepTaskListForm
      schema={schema}
      uiSchema={operationUiSchema}
      formData={{}}
      onSubmit={(e) => console.log(e)}
      onCancel={() => console.log("cancel")}
    />
  );
};

export default OperationForm;
