"use client";

import { WidgetProps } from "@rjsf/utils/lib/types";
import RadioWidget from "./RadioWidget";
import ToggleWidget from "./ToggleWidget";
import { Button } from "@mui/material";
import { actionHandler } from "@bciers/actions";
import { useState } from "react";
import { DARK_GREY_BG_COLOR } from "@bciers/styles";
import { AlertIcon } from "@bciers/components/icons";

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
  const [status, setStatus] = useState<string>(formContext?.isOptedOut ? "Opted-out" : "Opted-in");
  const [isEditing, setIsEditing] = useState<boolean>(false);
  // savedEffectiveDate reflects the value stored in the database
  const [savedEffectiveDate, setSavedEffectiveDate] = useState<string | undefined>(value?.effective_date);
  // pendingEffectiveDate reflects the value that is rendered in the UI
  const [pendingEffectiveDate, setPendingEffectiveDate] = useState<string | undefined>(value?.effective_date);
  const [error, setError] = useState<string | undefined>(undefined);

  const isCasDirector = Boolean(formContext?.isCasDirector);

  const optOutDateOptions = [
    { label: "Start of 2026", value: "Start of 2026" },
    { label: "End of 2026", value: "End of 2026" },
  ];

  const isDisabled = !isCasDirector || !isEditing;

  function saveOptedOutDetail(
    operationId: string,
  ) {
    const endpoint = `registration/operations/${operationId}/registration/opted-out-operation-detail`;

    const payload = JSON.stringify({ effective_date: pendingEffectiveDate})

    return actionHandler(endpoint, "POST", "", {
      body: payload
    })
  }

  // ---------- Handlers ------------------
  const handleRadioSelect = (val) => {
    if (!isEditing || isDisabled) return;
    setPendingEffectiveDate(val);
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

  const handleSave = async () => {
    const response = await saveOptedOutDetail(formContext?.operationId)
    
    if (response?.error) {
      setError(response?.error)
      return;
    }
    setSavedEffectiveDate(response.effective_date)
    setPendingEffectiveDate(response.effective_date)
    setIsEditing(false);
    setError(undefined);
  }

  const handleCancel = () => {
    setPendingEffectiveDate(savedEffectiveDate)
    setIsEditing(false);
    setError(undefined);
  }
  // ---------------------------------------

  return (
    <div className="space-y-3 p-4">
      <div className="flex items-center justify-between">
        <button type="button" className={`px-3 py-1 rounded-full text-sm ${status === "Opted-in" ? "bg-blue-500 text-white" : "bg-gray-200"}`} onClick={isCasDirector ? handleToggle : undefined}>
          {status}
        </button>
      </div>
      {status === "Opted-out" ? (
      <>
        <div className="text-sm font-semibold">Operation is opted out as of:</div>
        <div className="flex flex-col gap-2">
          {optOutDateOptions.map((opt) => (
            <label key={opt.value} className="flex items-center gap-2">
              <input type="radio" checked={pendingEffectiveDate === opt.value} onChange={() => handleRadioSelect(opt.value)} disabled={!isEditing || isDisabled} />
                <span>{opt.label}</span>
            </label>
          ))}
        </div>

          <div className="flex gap-2 pt-2">
            {isEditing ? (
              <>
                <Button onClick={handleCancel}>Cancel</Button>
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
export default OptedOutOperationWidget;
