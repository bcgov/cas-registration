"use client";

import { WidgetProps } from "@rjsf/utils/lib/types";
import { Button, TextField } from "@mui/material";
import { actionHandler } from "@bciers/actions";
import { useState } from "react";
import SnackBar from "../components/SnackBar";
import { DARK_GREY_BG_COLOR } from "@bciers/styles";
import Link from "next/link";
import { AlertIcon } from "@bciers/components/icons";

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
  formContext,
  name,
}) => {
  const [bcghgId, setBcghgId] = useState(value);
  const [isSnackbarOpen, setIsSnackbarOpen] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);
  const [editBcghgId, setEditBcghgId] = useState(false);
  const [manualBcghgId, setManualBcghgId] = useState("");

  const entityId = formContext?.operationId || formContext?.facilityId;
  const entityType = formContext?.operationId
    ? EntityWithBcghgType.OPERATION
    : EntityWithBcghgType.FACILITY;

  const handleClearBcghgId = async () => {
    const response = await clearBcghgId(entityId, entityType);
    if (response?.error) {
      setError(response?.error);
      return;
    }
    setBcghgId(undefined);
    setEditBcghgId(false);
    setError(undefined);
  };

  const handleSetBcghgId = async (
    bcghgIdToSet: string | undefined = undefined,
  ) => {
    if (bcghgIdToSet === "") {
      setError("BCGHG ID cannot be empty");
      return;
    }

    const response = await generateBcghgId(
      entityId,
      entityType,
      editBcghgId ? bcghgIdToSet : undefined,
    );

    if (response?.error) {
      setError(response?.error);
      return;
    }
    setIsSnackbarOpen(true);
    setBcghgId(response?.id);
    setEditBcghgId(false);
    setError(undefined);
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
            setError(undefined);
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
          setError("");
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
          <div id={id} className="read-only-widget whitespace-pre-line">
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
      {error && (
        <div
          className="flex items-center w-full text-red-600 ml-0"
          role="alert"
        >
          <div className="hidden md:block mr-3">
            <AlertIcon />
          </div>
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};
export default BcghgIdWidget;
