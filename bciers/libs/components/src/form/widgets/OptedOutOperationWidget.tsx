"use client";

import { WidgetProps } from "@rjsf/utils/lib/types";
import ComboBox from "./ComboBox";
import { actionHandler } from "@bciers/actions";
import { useState } from "react";
import { DARK_GREY_BG_COLOR } from "@bciers/styles";
import { AlertIcon } from "@bciers/components/icons";
import ToggleWidget from "./ToggleWidget";

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
  onChange,
  formContext,
  schema,
  uiSchema,
  registry
}) => {
  const [status, setStatus] = useState<string>(formContext?.isOptedOut ? "Opted-out" : "Opted-in");
  // pendingFinalReportingYear reflects the value that is rendered in the UI
  const [pendingFinalReportingYear, setPendingFinalReportingYear] = useState<number | undefined>(value?.final_reporting_year);
  const [error, setError] = useState<string | undefined>(undefined);

  const isCasDirector = Boolean(formContext?.isCasDirector);

  const isDisabled = !isCasDirector;

  const finalReportingYearSchema = schema?.properties?.final_reporting_year;

  function saveOptedOutDetail(
    operationId: string, val: number | undefined
  ) {
    const endpoint = `registration/operations/${operationId}/registration/opted-out-operation-detail`;

    const payload = { final_reporting_year: val}

    return actionHandler(endpoint, "POST", "", {
      body: JSON.stringify(payload)
    })
  }

  function deleteOptedOutDetail( operationId: string) {
    const endpoint = `registration/operations/${operationId}/registration/opted-out-operation-detail`;
    return actionHandler(endpoint, "DELETE", "")
  }

  // ---------- Handlers ------------------
  const handleComboChange = async (val: number | undefined) => {
    if (isDisabled) return;
    setPendingFinalReportingYear(val);

    // for RJSF validation
    onChange({
      ...(value ?? {}),
      final_reporting_year: val ?? null,
    });

    // persist the change to the database
    const response = await saveOptedOutDetail(formContext?.operationId, val)
    
    if (response?.error) {
      setError(response?.error)
      return;
    }
    setError(undefined);
  }

  const handleToggle = async (checked: boolean) => {
    if (!isCasDirector) return;

    setStatus(checked ? "Opted-in" : "Opted-out");

    if (checked) {
      // clear UI state
      setPendingFinalReportingYear(undefined)
      // tell RJSF the value no longer exists
      onChange(undefined);
      // delete the opted-out operation detail record in the database
      const response = await deleteOptedOutDetail(formContext?.operationId);

      if (response?.error) {
        setError(response.error);
        return;
      }

      setError(undefined);
      return;
    } 
  }

  // ---------------------------------------

  return (
    <div className="space-y-3 p-4">
      <div className="flex items-center justify-between">
        <ToggleWidget
          id={`${id}-opt-in-status`} 
          value={status === "Opted-in"}
          onChange={(checked: boolean) => {
            if (!isCasDirector) return;
            handleToggle(checked);
          }}
          disabled={!isCasDirector}
          trueLabel="Opted-in"
          falseLabel="Opted-out"
        />
      </div>
      {status === "Opted-out" ? (
        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold w-60">Year that final report is expected</label>
          <ComboBox
            id={`${id}-final-reporting-year`}
            schema={finalReportingYearSchema}
            value={pendingFinalReportingYear}
            registry={registry}
            onChange={handleComboChange}
            disabled={isDisabled}
            readonly={isDisabled}
            uiSchema={uiSchema?.final_reporting_year}
            rawErrors={error ? [error] : undefined}
            sx={{ width: 300 }}
          />
          {pendingFinalReportingYear !== undefined ? (
            <div>Operation will not report for {pendingFinalReportingYear + 1} reporting year and subsequent years</div>
          ) : null}
        </div>
      ) : null}
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
