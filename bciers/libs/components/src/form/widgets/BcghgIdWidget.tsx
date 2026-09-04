"use client";

import { WidgetProps } from "@rjsf/utils";
import { Button, TextField } from "@mui/material";
import { actionHandler } from "@bciers/actions";
import { useState } from "react";
import SnackBar from "../components/SnackBar";
import { DARK_GREY_BG_COLOR } from "@bciers/styles";
import Link from "next/link";
import {
  useValidationErrors,
  handleApiResponse,
  setClientError,
} from "@bciers/components/validationErrors";

export enum EntityWithBcghgType {
  OPERATION = "operation",
  FACILITY = "facility",
}

const styles = {
  "& .MuiOutlinedInput-root": {
    "& fieldset": {
      DARK_GREY_BG_COLOR,
    },
  },
  font: "inherit",
};

function clearBcghgId(entityId: string, entityType: EntityWithBcghgType) {
  const endpoint =
    entityType === EntityWithBcghgType.OPERATION
      ? `registration/operations/${entityId}/bcghg-id`
      : `registration/facilities/${entityId}/bcghg-id`;

  return actionHandler(endpoint, "DELETE", "");
}

function generateBcghgId(
  entityId: string,
  entityType: EntityWithBcghgType,
  bcghgIdOverride?: string,
) {
  const endpoint =
    entityType === EntityWithBcghgType.OPERATION
      ? `registration/operations/${entityId}/bcghg-id`
      : `registration/facilities/${entityId}/bcghg-id`;

  const payload = bcghgIdOverride
    ? JSON.stringify({ bcghg_id: bcghgIdOverride })
    : "{}";

  return actionHandler(endpoint, "PATCH", "", {
    body: payload,
  });
}

const BcghgIdWidget: React.FC<WidgetProps> = ({
  id,
  value,
  registry,
  name,
}) => {
  const [bcghgId, setBcghgId] = useState(value);
  const [isSnackbarOpen, setIsSnackbarOpen] = useState(false);
  const { setErrors, renderedErrors } = useValidationErrors();
  const [editBcghgId, setEditBcghgId] = useState(false);
  const [manualBcghgId, setManualBcghgId] = useState("");
  const { formContext } = registry;

  const entityId = formContext?.operationId || formContext?.facilityId;
  const entityType = formContext?.operationId
    ? EntityWithBcghgType.OPERATION
    : EntityWithBcghgType.FACILITY;

  const handleClearBcghgId = async () => {
    setErrors(undefined);
    const response = await clearBcghgId(entityId, entityType);
    const isSuccess = handleApiResponse(response, setErrors);
    if (!isSuccess) return;
    setBcghgId(undefined);
    setEditBcghgId(false);
  };

  const handleSetBcghgId = async (
    bcghgIdToSet: string | undefined = undefined,
  ) => {
    setErrors(undefined);
    if (bcghgIdToSet === "") {
      const message = "BCGHG ID cannot be empty";
      setClientError(message, setErrors);
      return;
    }

    const response = await generateBcghgId(
      entityId,
      entityType,
      editBcghgId ? bcghgIdToSet : undefined,
    );
    const isSuccess = handleApiResponse(response, setErrors);
    if (!isSuccess) return;
    setIsSnackbarOpen(true);
    setBcghgId(response?.id);
    setEditBcghgId(false);
  };

  const editBcghgIdJsx = editBcghgId ? (
    <div className="flex flex-col ml-4">
      <div>
        <TextField
          sx={styles}
          id={`${id}-input`}
          name={`${name}-input`}
          onChange={(e) => {
            setManualBcghgId(e.target.value);
          }}
          size="small"
          inputRef={(el) => el?.focus()}
        />
        <Button onClick={() => handleSetBcghgId(manualBcghgId)}>Save</Button>
        <Button
          onClick={() => {
            setEditBcghgId(false);
            setErrors(undefined);
          }}
        >
          Cancel
        </Button>
      </div>
    </div>
  ) : (
    <div data-testid="edit-bcghg-id-text" style={{ marginLeft: "8px" }}>
      or click {""}
      <Link
        href="#"
        style={{ cursor: "pointer" }}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setErrors(undefined);
          setEditBcghgId(true);
        }}
      >
        edit
      </Link>{" "}
      to enter a BCGHGID
    </div>
  );

  return (
    <div className="flex flex-col w-full">
      <div className="flex items-center w-full">
        {formContext?.isCasDirector && !bcghgId && !formContext?.isSfo ? (
          <div style={{ paddingLeft: "14px" }}>
            <Button
              variant="outlined"
              disabled={editBcghgId}
              onClick={() => handleSetBcghgId()}
            >
              &#xFF0B; Issue BCGHG ID
            </Button>
          </div>
        ) : (
          <div
            id={id}
            className="read-only-widget whitespace-pre-line"
            style={{ width: "auto" }}
          >
            {bcghgId ? `${bcghgId}` : "Pending"}
          </div>
        )}
        {formContext?.isCasDirector && bcghgId && !formContext?.isSfo && (
          <Button
            variant="outlined"
            disabled={editBcghgId}
            sx={{ ml: "14px" }}
            onClick={() => handleClearBcghgId()}
          >
            Clear BCGHG ID
          </Button>
        )}
        {formContext?.isCasDirector && !formContext?.isSfo && editBcghgIdJsx}
        <SnackBar
          isSnackbarOpen={isSnackbarOpen}
          message="BCGHG ID issued successfully"
          setIsSnackbarOpen={setIsSnackbarOpen}
        />
      </div>
      {renderedErrors && <div className="mt-2 w-full">{renderedErrors}</div>}
    </div>
  );
};
export default BcghgIdWidget;
