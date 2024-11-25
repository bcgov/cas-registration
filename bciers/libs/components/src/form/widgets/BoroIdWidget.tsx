"use client";

import { WidgetProps } from "@rjsf/utils/lib/types";
import { Button } from "@mui/material";
import { actionHandler } from "@bciers/actions";
import { useState } from "react";
import SnackBar from "../components/SnackBar";
import { OperationStatus } from "@bciers/utils/src/enums";

async function generateBoroId(id: string) {
  const response = await actionHandler(
    `registration/v2/operations/${id}/boro-id`,
    "PATCH",
    `registration/administration/operations/${id}`,
  );
  return response;
}

const BoroIdWidget: React.FC<WidgetProps> = ({ id, value, formContext }) => {
  const [boroId, setBoroId] = useState(value);
  const [isSnackbarOpen, setIsSnackbarOpen] = useState(false);
  const [error, setError] = useState(undefined);

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
  if (error) {
    return (
      <div id={id} className="read-only-widget whitespace-pre-line">
        Error: {error}
      </div>
    );
  }

  if (formContext?.isCasDirector && !boroId) {
    return (
      <Button
        variant="outlined"
        onClick={async () => {
          const response = await generateBoroId(formContext?.operationId);
          if (response?.error) {
            setError(response.error);
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
