"use client";

import { WidgetProps } from "@rjsf/utils/lib/types";
import RadioWidget from "./RadioWidget";
import ToggleWidget from "./ToggleWidget";
import { Button } from "@mui/material";
import { actionHandler } from "@bciers/actions";
import { useState } from "react";
import { DARK_GREY_BG_COLOR } from "@bciers/styles";

const styles = {
  "& .MuiOutlinedInput-root": {
    "& fieldset": {
      DARK_GREY_BG_COLOR,
    },
  },
  font: "inherit",
};

const OptedOutOperationWidget: React.FC<WidgetProps> = ({
  id,
  value,
  formContext,
  name,
}) => {
  const isOptedOut = formContext?.isOptedOut;
  const [status, setStatus] = useState<string>("Opted-in");
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [optedOutDate, setOptedOutDate] = useState<string | undefined>(undefined);

  const isCasDirector = Boolean(formContext?.isCasDirector);

  const optOutDateOptions = [
    { label: "Start of 2026", value: "Start of 2026" },
    { label: "End of 2026", value: "End of 2026" },
  ];

  const isDisabled = !isCasDirector || !isEditing;

  // ---------- Handlers ------------------
  const handleRadioSelect = (val) => {
    if (!isEditing || isDisabled) return;
    setOptedOutDate(val);
  }

  const handleToggle = () => {
    const newStatus = status === "Opted-in" ? "Opted-out" : "Opted-in";
    setStatus(newStatus);

    if (newStatus === "Opted-in") {
      setIsEditing(false);
    } else {
      setIsEditing(true);
    }
  }

  const handleSave = () => {
    const endpoint = `registration/operations/${formContext.operationId}/registration/opted-out-operation-detail`;
    const payload = JSON.stringify({ effective_date: optedOutDate})
    console.log(value);
    const method = value === undefined ? "POST" : "PUT"

    setIsEditing(false);
    return actionHandler(endpoint, method, "", {
      body: payload
    })
  }
  // ---------------------------------------

  return (
    <div className="space-y-3 p-4">
      <div className="flex items-center justify-between">
        <button type="button" className={`px-3 py-1 rounded-full text-sm ${isOptedOut ? "bg-blue-500 text-white" : "bg-gray-200"}`} onClick={isCasDirector ? handleToggle : undefined}>
          {status}
        </button>
      </div>
      {isOptedOut && !isDisabled ? (
      <>
        <div className="text-sm font-semibold">Operation is opted out as of:</div>
        <div className="flex flex-col gap-2">
          {optOutDateOptions.map((opt) => (
            <label key={opt.value} className="flex items-center gap-2">
              <input type="radio" checked={optedOutDate === opt.value} onChange={() => handleRadioSelect(opt.value)} disabled={!isEditing || isDisabled} />
                <span>{opt.label}</span>
            </label>
          ))}
        </div>

          <div className="flex gap-2 pt-2">
            {isEditing ? (
              <>
                <Button onClick={() => setIsEditing(false)}>Cancel</Button>
                <Button onClick={handleSave}>Save</Button>
              </>
            ) : (
              <Button onClick={() => setIsEditing(true)}>Edit</Button>
            )}
          </div>
      </>
      ) : (
        <div className="text-muted-foreground text-sm italic">
          (Opt-out details appear here when the operation is opted-out.)
        </div>
      )}
    </div>
  );
};
export default OptedOutOperationWidget;
