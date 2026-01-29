"use client";

import { WidgetProps } from "@rjsf/utils/lib/types";
import ComboBox from "./ComboBox";
import { actionHandler } from "@bciers/actions";
import { useState, useLayoutEffect } from "react";
import { AlertIcon } from "@bciers/components/icons";
import ToggleWidget from "./ToggleWidget";
import { BC_GOV_COMPONENTS_GREY, BC_GOV_SEMANTICS_RED } from "@bciers/styles";

function saveOptedOutDetail(operationId: string, val: number | undefined) {
  const endpoint = `registration/operations/${operationId}/registration/opted-in-operation-detail/final-reporting-year`;

  const payload = { final_reporting_year: val };

  return actionHandler(endpoint, "PUT", "", {
    body: JSON.stringify(payload),
  });
}

function clearOptedOutDetail(operationId: string) {
  // Clear final_reporting_year to opt back in
  const endpoint = `registration/operations/${operationId}/registration/opted-in-operation-detail/final-reporting-year`;
  const payload = { final_reporting_year: null };
  return actionHandler(endpoint, "PUT", "", {
    body: JSON.stringify(payload),
  });
}

const OptedOutOperationWidget: React.FC<WidgetProps> = ({
  id,
  value,
  onChange,
  formContext,
  schema,
  uiSchema,
  registry,
}) => {
  // Handle both object format ({ final_reporting_year: number }) and direct number format
  let finalReportingYear: number | undefined;
  if (typeof value === "object" && value !== null) {
    finalReportingYear = value.final_reporting_year;
  } else if (typeof value === "number") {
    finalReportingYear = value;
  }

  // Initialize status from final_reporting_year if available
  const initialStatus =
    finalReportingYear !== undefined && finalReportingYear !== null
      ? "Opted-out"
      : "Opted-in";
  const [status, setStatus] = useState<string>(initialStatus);
  // pendingFinalReportingYear reflects the value that is rendered in the UI
  const [pendingFinalReportingYear, setPendingFinalReportingYear] = useState<
    number | undefined
  >(finalReportingYear);
  const [error, setError] = useState<string | undefined>(undefined);

  // Sync status when value changes from outside (e.g., initial load)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useLayoutEffect(() => {
    if (finalReportingYear !== undefined && finalReportingYear !== null) {
      setStatus("Opted-out");
    }
  }, [finalReportingYear]);

  const isCasDirector = Boolean(formContext?.isCasDirector);

  const isDisabled = !isCasDirector;

  // Schema now has anyOf directly on the field (not nested under final_reporting_year)
  const finalReportingYearSchema = schema || {};

  // ---------- Handlers ------------------
  const handleComboChange = async (val: number | undefined) => {
    if (isDisabled) return;
    setPendingFinalReportingYear(val);

    // for RJSF validation - pass the number directly (simplified format)
    onChange(val ?? null);

    // persist the change to the database
    const response = await saveOptedOutDetail(formContext?.operationId, val);

    if (response?.error) {
      setError(response?.error);
      return;
    }
    setError(undefined);
  };

  const handleToggle = async (checked: boolean) => {
    if (!isCasDirector) return;

    if (checked) {
      // User is toggling to opted-in (opting back in)
      // clear UI state
      setPendingFinalReportingYear(undefined);
      // tell RJSF the value no longer exists
      onChange(undefined);
      // clear the opted-out status by setting final_reporting_year to null
      const response = await clearOptedOutDetail(formContext?.operationId);

      if (response?.error) {
        setError(response.error);
        return;
      }

      setError(undefined);
    } else {
      // User is toggling to opted-out
      setStatus("Opted-out");
    }
  };

  // ---------------------------------------

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-[280px_1fr] items-center gap-4">
        <label
          className="text-base font-bold text-left"
          htmlFor={`${id}-opt-in-status`}
        >
          Opt-in status:
        </label>
        <div>
          <ToggleWidget
            {...({
              id: `${id}-opt-in-status`,
              value: status === "Opted-in",
              onChange: (checked: boolean) => {
                handleToggle(checked);
              },
              disabled: !isCasDirector,
              trueLabel: "Opted-in",
              falseLabel: "Opted-out",
              schema: {},
              uiSchema: {},
              formContext: {},
              registry,
            } as unknown as WidgetProps)}
          />
        </div>
      </div>
      {/* Year selector is always visible for CAS Director users to allow setting/removing final_reporting_year */}
      <div className="grid grid-cols-[280px_1fr] items-start gap-4">
        <label
          className="text-base font-bold text-left pt-2"
          htmlFor={`${id}-final-reporting-year`}
        >
          Year that final report is expected
        </label>
        <div className="flex flex-col gap-2">
          <div style={{ width: 300, minWidth: "12rem" }}>
            <ComboBox
              id={`${id}-final-reporting-year`}
              schema={
                (finalReportingYearSchema ||
                  {}) as unknown as WidgetProps["schema"]
              }
              value={pendingFinalReportingYear}
              registry={registry}
              onChange={handleComboChange}
              disabled={isDisabled}
              readonly={isDisabled}
              uiSchema={uiSchema?.final_reporting_year}
              rawErrors={error ? [error] : undefined}
              name={`${id}-final-reporting-year`}
              options={{}}
              onBlur={() => {}}
              onFocus={() => {}}
              label=""
              formContext={formContext}
            />
          </div>
          {error && (
            <div
              className="flex items-center text-sm"
              role="alert"
              style={{ color: BC_GOV_SEMANTICS_RED }}
            >
              <div className="hidden md:block mr-2">
                <AlertIcon />
              </div>
              <span>{error}</span>
            </div>
          )}
          {pendingFinalReportingYear !== undefined && (
            <div
              className="text-sm leading-relaxed"
              style={{ color: BC_GOV_COMPONENTS_GREY }}
            >
              Operation will not report for {pendingFinalReportingYear + 1}{" "}
              reporting year and subsequent years
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
export default OptedOutOperationWidget;
