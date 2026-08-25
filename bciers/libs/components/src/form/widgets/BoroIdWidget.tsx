"use client";

import { WidgetProps } from "@rjsf/utils";
import { Button } from "@mui/material";
import { actionHandler } from "@bciers/actions";
import { useState } from "react";
import SnackBar from "../components/SnackBar";
import { OperationStatus } from "@bciers/utils/src/enums";
import {
  useValidationErrors,
  handleApiResponse,
} from "@bciers/components/validationErrors";

async function generateBoroId(id: string) {
  const response = await actionHandler(
    `registration/operations/${id}/boro-id`,
    "PATCH",
    `registration/administration/operations/${id}`,
  );
  return response;
}

const BoroIdWidget: React.FC<WidgetProps> = ({ id, value, registry }) => {
  const [boroId, setBoroId] = useState(value);
  const [isSnackbarOpen, setIsSnackbarOpen] = useState(false);
  const { setErrors, renderedErrors } = useValidationErrors();
  const { formContext } = registry;

  if (!formContext.isRegulatedOperation) {
    return (
      <div id={id} className="read-only-widget whitespace-pre-line">
        Not applicable
      </div>
    );
  }
  if (formContext.status !== OperationStatus.REGISTERED) {
    return (
      <div id={id} className="read-only-widget whitespace-pre-line">
        Cannot be issued yet. Operation is not registered.
      </div>
    );
  }
  if (renderedErrors) {
    return (
      <div id={id} className="read-only-widget whitespace-pre-line">
        {renderedErrors}
      </div>
    );
  }

  if (formContext?.isCasDirector && !boroId) {
    return (
      <Button
        variant="outlined"
        onClick={async () => {
          setErrors(undefined);
          const response = await generateBoroId(formContext?.operationId);
          if (!handleApiResponse(response, setErrors)) {
            return;
          }
          setIsSnackbarOpen(true);
          setBoroId(response?.id);
        }}
      >
        &#xFF0B; Issue BORO ID
      </Button>
    );
  }
  return (
    <>
      <div id={id} className="read-only-widget whitespace-pre-line">
        {boroId ? `${boroId} BORO ID issued` : "Pending"}
      </div>
      <SnackBar
        isSnackbarOpen={isSnackbarOpen}
        message="BORO ID issued successfully"
        setIsSnackbarOpen={setIsSnackbarOpen}
      />
    </>
  );
};
export default BoroIdWidget;
