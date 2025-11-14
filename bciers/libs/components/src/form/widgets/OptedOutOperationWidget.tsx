"use client";

import { WidgetProps } from "@rjsf/utils/lib/types";
import RadioWidget from "./RadioWidget";
import { Button, TextField } from "@mui/material";
import { actionHandler } from "@bciers/actions";
import { useState } from "react";
// import SnackBar from "../components/SnackBar";
import { DARK_GREY_BG_COLOR } from "@bciers/styles";
import { AlertIcon } from "@bciers/components/icons";

// export enum EntityWithBcghgType {
//   OPERATION = "operation",
//   FACILITY = "facility",
// }

const styles = {
  "& .MuiOutlinedInput-root": {
    "& fieldset": {
      DARK_GREY_BG_COLOR,
    },
  },
  font: "inherit",
};

// function clearBcghgId(entityId: string, entityType: EntityWithBcghgType) {
//   const endpoint =
//     entityType === EntityWithBcghgType.OPERATION
//       ? `registration/operations/${entityId}/bcghg-id`
//       : `registration/facilities/${entityId}/bcghg-id`;

//   return actionHandler(endpoint, "DELETE", "");
// }

// function generateBcghgId(
//   entityId: string,
//   entityType: EntityWithBcghgType,
//   bcghgIdOverride?: string,
// ) {
//   const endpoint =
//     entityType === EntityWithBcghgType.OPERATION
//       ? `registration/operations/${entityId}/bcghg-id`
//       : `registration/facilities/${entityId}/bcghg-id`;

//   const payload = bcghgIdOverride
//     ? JSON.stringify({ bcghg_id: bcghgIdOverride })
//     : "{}";

//   return actionHandler(endpoint, "PATCH", "", {
//     body: payload,
//   });
// }

const OptedOutOperationWidget: React.FC<WidgetProps> = ({
  id,
  value,
  formContext,
  name,
}) => {
  // const [bcghgId, setBcghgId] = useState(value);
  const [optOutDate, setOptOutDate] = useState<string | undefined>(value);
  const [draftValue, setDraftValue] = useState<string | undefined>(undefined);
//   const [isSnackbarOpen, setIsSnackbarOpen] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);
  // const [editBcghgId, setEditBcghgId] = useState(false);
  // const [manualBcghgId, setManualBcghgId] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  const isCasDirector = Boolean(formContext?.isCasDirector);

  const optOutDateOptions = [
    { label: "Start of 2026", value: "Start of 2026" },
    { label: "End of 2026", value: "End of 2026" },
  ];

  const isDisabled = !isCasDirector || !isEditing;

  const handleSaveOptOutDate = async(
    effectiveDate: string | undefined = undefined
  ) => {
    setIsEditing(true);
    // either POST or PUT to endpoint depending on
    // create or update opt out detail

    setOptOutDate(effectiveDate);

    // TODO: send data to API
    // return actionHandler(endpoint)
    setError(undefined);
  }

  const startEditing = () => {
    setDraftValue(value);
    setIsEditing(true);
  }

  const cancelEditing = () => {
    setDraftValue(value);
    setIsEditing(false);
  }

  const saveEditing = () => {
    handleSaveOptOutDate(draftValue);
  }

  // const entityId = formContext?.operationId || formContext?.facilityId;
//   const entityType = formContext?.operationId
//     ? EntityWithBcghgType.OPERATION
//     : EntityWithBcghgType.FACILITY;

//   const handleClearBcghgId = async () => {
//     const response = await clearBcghgId(entityId, entityType);
//     if (response?.error) {
//       setError(response?.error);
//       return;
//     }
//     setBcghgId(undefined);
//     setEditBcghgId(false);
//     setError(undefined);
//   };

  // const handleSetBcghgId = async (
  //   bcghgIdToSet: string | undefined = undefined,
  // ) => {
  //   if (bcghgIdToSet === "") {
  //     setError("BCGHG ID cannot be empty");
  //     return;
  //   }

  //   const response = await generateBcghgId(
  //     entityId,
  //     entityType,
  //     editBcghgId ? bcghgIdToSet : undefined,
  //   );

  //   if (response?.error) {
  //     setError(response?.error);
  //     return;
  //   }
  //   // setIsSnackbarOpen(true);
  //   setBcghgId(response?.id);
  //   setEditBcghgId(false);
  //   setError(undefined);
  // };

  return (
    <div className="space-y-2">

      <RadioWidget 
        id="opted_out_operation_detail" 
        value={draftValue}
        onChange={setDraftValue}
        onBlur={() => {}}
        onFocus={() => {}}
        uiSchema={{}}
        options={{
          enumOptions: optOutDateOptions,
          enumDisabled: [],
          emptyValue: undefined,
        }} 
        name="opted_out_operation_detail" 
        disabled={isDisabled}
        readonly={isDisabled}  
      />

      {isCasDirector && (
        <div className="flex gap-2 pt-2">
          {isEditing ? (
            <>
            <Button onClick={cancelEditing} className="px-2 py-1 border rounded bg-gray-100 hover:bg-gray-200">
              Cancel
            </Button>
            <Button onClick={saveEditing} className="px-2 py-1 border rounded bg-blue-500 text-white hover:bg-blue-600">
              Save
            </Button>
            </>
          ) : (
            <Button onClick={startEditing} className="px-2 py-1 border rounded bg-gray-100 hover:bg-gray-200">
              Edit
            </Button>
          )}
        </div>
      )}
    </div>
    
  );
};
export default OptedOutOperationWidget;
