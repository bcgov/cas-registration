"use client";

import { WidgetProps } from "@rjsf/utils/lib/types";
import { Button, TextField } from "@mui/material";
import { actionHandler } from "@bciers/actions";
import { useState } from "react";
import SnackBar from "../components/SnackBar";
import { DARK_GREY_BG_COLOR } from "@bciers/styles";
import Link from "next/link";

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

function generateBcghgId(
  entityId: string,
  entityType: EntityWithBcghgType,
  bxghgIdOverride?: string,
) {
  const endpoint =
    entityType === EntityWithBcghgType.OPERATION
      ? `registration/operations/${entityId}/bcghg-id`
      : `registration/facilities/${entityId}/bcghg-id`;
  const payload = bxghgIdOverride
    ? JSON.stringify({ bcghg_id: bxghgIdOverride })
    : undefined;
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
  const [error, setError] = useState(undefined);

  const [editBcghgId, setEditBcghgId] = useState(false);
  const [manualBcghgId, setManualBcghgId] = useState("");

  if (error) {
    return (
      <div id={id} className="read-only-widget whitespace-pre-line">
        Error: {error}
      </div>
    );
  }

  const handleIssueBcghgId = async () => {
    const response = await generateBcghgId(
      formContext?.operationId || formContext?.facilityId,
      formContext?.operationId
        ? EntityWithBcghgType.OPERATION
        : EntityWithBcghgType.FACILITY,
      editBcghgId ? manualBcghgId : undefined,
    );

    if (response?.error) {
      setError(response?.error);
      return;
    }
    setIsSnackbarOpen(true);
    setBcghgId(response?.id);
  };

  if (formContext?.isCasDirector && !bcghgId && !formContext?.isSfo) {
    return (
      <>
        <Button
          variant="outlined"
          sx={{ mr: "14px" }}
          disabled={editBcghgId}
          onClick={handleIssueBcghgId}
        >
          &#xFF0B; Issue BCGHG ID
        </Button>
        {editBcghgId ? (
          <>
            <TextField
              sx={styles}
              id={`${id}-input`}
              name={`${name}-input`}
              onChange={(e) => {
                setManualBcghgId(e.target.value);
              }}
              size="small"
              inputRef={(el) => el && el.focus()}
            />
            <Button onClick={handleIssueBcghgId}>Save</Button>
            <Button onClick={() => setEditBcghgId(false)}>Cancel</Button>
          </>
        ) : (
          <>
            Or click&nbsp;
            <Link
              href="#"
              style={{ cursor: "pointer" }}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setEditBcghgId(true);
              }}
            >
              edit
            </Link>
            &nbsp;to enter a BCGHGID
          </>
        )}
      </>
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
