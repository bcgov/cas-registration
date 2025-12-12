"use client";

import { WidgetProps } from "@rjsf/utils/lib/types";
import ComboBox from "./ComboBox";
import { actionHandler } from "@bciers/actions";
import { useState } from "react";
import { AlertIcon } from "@bciers/components/icons";
import ToggleWidget from "./ToggleWidget";
import { BC_GOV_COMPONENTS_GREY, BC_GOV_SEMANTICS_RED } from "@bciers/styles";

const OptedOutOperationWidget: React.FC<WidgetProps> = ({
  id,
  value,
  onChange,
  formContext,
  schema,
  uiSchema,
  registry,
}) => {
  const [status, setStatus] = useState<string>(
    formContext?.isOptedOut ? "Opted-out" : "Opted-in",
  );
  // pendingFinalReportingYear reflects the value that is rendered in the UI
  const [pendingFinalReportingYear, setPendingFinalReportingYear] = useState<
    number | undefined
  >(value?.final_reporting_year);
  const [error, setError] = useState<string | undefined>(undefined);

  const isCasDirector = Boolean(formContext?.isCasDirector);

  const isDisabled = !isCasDirector;

  const finalReportingYearSchema = schema?.properties?.final_reporting_year;

  function saveOptedOutDetail(operationId: string, val: number | undefined) {
    const endpoint = `registration/operations/${operationId}/registration/opted-out-operation-detail`;

    const payload = { final_reporting_year: val };

    return actionHandler(endpoint, "POST", "", {
      body: JSON.stringify(payload),
    });
  }

  function deleteOptedOutDetail(operationId: string) {
    const endpoint = `registration/operations/${operationId}/registration/opted-out-operation-detail`;
    return actionHandler(endpoint, "DELETE", "");
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
    const response = await saveOptedOutDetail(formContext?.operationId, val);

    if (response?.error) {
      setError(response?.error);
      return;
    }
    setError(undefined);
  };

  const handleToggle = async (checked: boolean) => {
    if (!isCasDirector) return;

    setStatus(checked ? "Opted-in" : "Opted-out");

    if (checked) {
      // clear UI state
      setPendingFinalReportingYear(undefined);
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
  };

  // ---------------------------------------

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-[280px_1fr] items-center gap-4">
        <label className="text-base font-bold text-left">Opt-in status:</label>
        <div>
          <ToggleWidget
            {...({
              id: `${id}-opt-in-status`,
              value: status === "Opted-in",
              onChange: (checked: boolean) => {
                if (!isCasDirector) return;
                handleToggle(checked);
              },
              disabled: !isCasDirector,
              trueLabel: "Opted-in",
              falseLabel: "Opted-out",
              schema: {},
              uiSchema: {},
              formContext: {},
              registry,
            } as any)}
          />
        </div>
      </div>
      {status === "Opted-out" && (
        <div className="grid grid-cols-[280px_1fr] items-start gap-4">
          <label className="text-base font-bold text-left pt-2">
            Year that final report is expected
          </label>
          <div className="flex flex-col gap-2">
            <div style={{ width: 300, minWidth: "12rem" }}>
              <ComboBox
                id={`${id}-final-reporting-year`}
                schema={(finalReportingYearSchema || {}) as any}
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
      )}
    </div>
  );
};
export default OptedOutOperationWidget;
