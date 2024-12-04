"use client";

import { WidgetProps } from "@rjsf/utils/lib/types";
import { Button } from "@mui/material";
import { actionHandler } from "@bciers/actions";
import { useState } from "react";
import SnackBar from "../components/SnackBar";

export enum EntityWithBcghgType {
  OPERATION = "operation",
  FACILITY = "facility",
}

function generateBcghgId(entityId: string, entityType: EntityWithBcghgType) {
  const endpoint =
    entityType === EntityWithBcghgType.OPERATION
      ? `registration/operations/${entityId}/bcghg-id`
      : `registration/facilities/${entityId}/bcghg-id`;

  return actionHandler(endpoint, "PATCH", "");
}

const BcghgIdWidget: React.FC<WidgetProps> = ({ id, value, formContext }) => {
  const [bcghgId, setBcghgId] = useState(value);
  const [isSnackbarOpen, setIsSnackbarOpen] = useState(false);
  const [error, setError] = useState(undefined);

  if (error) {
    return (
      <div id={id} className="read-only-widget whitespace-pre-line">
        Error: {error}
      </div>
    );
  }

  if (formContext?.isCasDirector && !bcghgId) {
    return (
      <Button
        variant="outlined"
        onClick={async () => {
          const response = await generateBcghgId(
            formContext?.operationId || formContext?.facilityId,
            formContext?.operationId
              ? EntityWithBcghgType.OPERATION
              : EntityWithBcghgType.FACILITY,
          );

          if (response?.error) {
            setError(response?.error);
            return;
          }
          setIsSnackbarOpen(true);
          setBcghgId(response?.id);
        }}
      >
        &#xFF0B; Issue BCGHG ID
      </Button>
    );
  }
  return (
    <>
      <div id={id} className="read-only-widget whitespace-pre-line">
        {bcghgId ? `${bcghgId} BCGHG ID issued` : "Pending"}
      </div>
      <SnackBar
        isSnackbarOpen={isSnackbarOpen}
        message="BCGHG ID issued successfully"
        setIsSnackbarOpen={setIsSnackbarOpen}
      />
    </>
  );
};
export default BcghgIdWidget;
