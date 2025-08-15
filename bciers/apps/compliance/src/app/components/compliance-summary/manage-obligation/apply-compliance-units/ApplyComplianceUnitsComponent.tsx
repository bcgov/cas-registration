"use client";

import ComplianceStepButtons from "@/compliance/src/app/components/ComplianceStepButtons";
import { FormBase } from "@bciers/components/form";
import { useRouter } from "next/navigation";
import { useMemo, useState, useEffect } from "react";
import {
  applyComplianceUnitsBaseSchema,
  applyComplianceUnitsConfirmationSchema,
  applyComplianceUnitsDataSchema,
  createApplyComplianceUnitsUiSchema,
} from "@/compliance/src/app/data/jsonSchema/manageObligation/applyComplianceUnitsSchema";
import { getBccrAccountDetails } from "@/compliance/src/app/utils/bccrAccountHandlers";
import {
  BccrComplianceAccountResponse,
  ApplyComplianceUnitsFormData,
  BccrUnit,
} from "@/compliance/src/app/types";
import FormAlerts from "@bciers/components/form/FormAlerts";
import { ApplyComplianceUnitsAlertNote } from "./ApplyComplianceUnitsAlertNote";
import { IChangeEvent } from "@rjsf/core";
import { actionHandler } from "@bciers/actions";
import SubmitButton from "@bciers/components/button/SubmitButton";
import getOperationByComplianceReportVersionId from "@/compliance/src/app/utils/getOperationByComplianceReportVersionId";

interface ApplyComplianceUnitsComponentProps {
  complianceReportVersionId: number;
  reportingYear: number;
}

export type ComplianceLimitStatus = "EXCEEDS" | "EQUALS" | "BELOW";

export default function ApplyComplianceUnitsComponent({
  complianceReportVersionId,
  reportingYear,
}: Readonly<ApplyComplianceUnitsComponentProps>) {
  const router = useRouter();
  const [formData, setFormData] = useState<ApplyComplianceUnitsFormData | {}>(
    {},
  );
  const [operationName, setOperationName] = useState<string>();
  type Status = "idle" | "submitting" | "submitted" | "applying" | "applied";

  const [currentPhase, setCurrentPhase] = useState<
    "initial" | "confirmation" | "compliance_data"
  >("initial");
  const [errors, setErrors] = useState<string[] | undefined>();
  const [status, setStatus] = useState<Status>("idle");
  // Keep track of the remaining cap from the API (what's left to apply)
  const [remainingCap, setRemainingCap] = useState<number>(0);
  // Legacy / fallback outstanding balance (not used for limit enforcement)
  const [initialOutstandingBalance, setInitialOutstandingBalance] =
    useState<number>(0);

  useEffect(() => {
    const fetchOperationName = async () => {
      const operation = await getOperationByComplianceReportVersionId(
        complianceReportVersionId,
      );
      setOperationName(operation?.name || "");
    };

    fetchOperationName();
  }, [complianceReportVersionId]);

  // Calculate summary values based on BCCR units user has selected
  const calculateSummaryValues = (
    chargeRate: number,
    units: BccrUnit[] = [],
  ): Pick<
    ApplyComplianceUnitsFormData,
    | "total_quantity_to_be_applied"
    | "total_equivalent_emission_reduced"
    | "total_equivalent_value"
    | "outstanding_balance"
  > => {
    const totalQuantityToBeApplied = units.reduce(
      (sum, unit) => sum + (unit.quantity_to_be_applied || 0),
      0,
    );

    // equivalent emission reduced is the same as quantity
    const totalEquivalentEmissionReduced = totalQuantityToBeApplied;

    // Calculate total value based on charge rate
    const totalEquivalentValue = totalEquivalentEmissionReduced * chargeRate;

    // Calculate remaining outstanding balance by subtracting the equivalent value from initial balance
    const outstandingBalance = initialOutstandingBalance - totalEquivalentValue;

    return {
      total_quantity_to_be_applied: totalQuantityToBeApplied,
      total_equivalent_emission_reduced: totalEquivalentEmissionReduced,
      total_equivalent_value: totalEquivalentValue,
      outstanding_balance: outstandingBalance,
    };
  };

  const handleChange = (e: IChangeEvent<ApplyComplianceUnitsFormData>) => {
    const newFormData = e.formData;
    const prevAccountId = (formData as ApplyComplianceUnitsFormData)
      ?.bccr_holding_account_id;
    const newAccountId = newFormData?.bccr_holding_account_id;

    // If account ID changed, clear everything except the account ID
    if (prevAccountId !== newAccountId) {
      setFormData({
        bccr_holding_account_id: newAccountId,
      });
      setStatus("idle");
      setCurrentPhase("initial");
      return;
    }

    if (currentPhase === "compliance_data") {
      // Only update if we have units with meaningful changes (quantity_to_be_applied changes)
      if (
        newFormData &&
        Array.isArray(newFormData.bccr_units) &&
        newFormData.bccr_units.length > 0
      ) {
        const summaryValues = calculateSummaryValues(
          newFormData.charge_rate,
          newFormData.bccr_units,
        );

        const merged = {
          ...newFormData,
          ...summaryValues,
        };
        setFormData(merged);
      }
      // Don't update form data if we don't have valid units in compliance phase
      return;
    }

    // For initial and confirmation phases, handle normally
    if (
      newFormData &&
      Array.isArray(newFormData.bccr_units) &&
      newFormData.bccr_units.length > 0
    ) {
      const summaryValues = calculateSummaryValues(
        newFormData.charge_rate,
        newFormData.bccr_units,
      );

      const merged = {
        ...newFormData,
        ...summaryValues,
      };
      setFormData(merged);
    } else {
      setFormData({
        ...newFormData,
      });
    }
  };

  // First submission: Get compliance data and display it
  const handleSubmit = async (
    e: IChangeEvent<ApplyComplianceUnitsFormData>,
  ) => {
    setStatus("submitting");
    const response = await actionHandler(
      `compliance/bccr/accounts/${e.formData?.bccr_holding_account_id}/compliance-report-versions/${complianceReportVersionId}/compliance-units`,
      "GET",
      "",
    );
    if (!response || response.error) {
      setStatus("idle");
      setErrors([response?.error || "Failed to get compliance units data"]);
    } else {
      // Set the remaining cap from the response (what’s left to apply)
      setRemainingCap(Number(response.compliance_unit_cap_remaining));

      // Set the outstanding balance from the response
      setInitialOutstandingBalance(response.outstanding_balance || 0);

      // Update form data with the full compliance data from the response
      setFormData((prev: ApplyComplianceUnitsFormData) => {
        // Create a clean data object for the compliance phase
        const cleanFormData = {
          bccr_holding_account_id: prev.bccr_holding_account_id,
          bccr_trading_name: prev.bccr_trading_name,
          ...response,
        };

        setCurrentPhase("compliance_data");
        return cleanFormData;
      });

      setStatus("submitted");
      setErrors(undefined);
    }
  };

  // Second submission: Apply the compliance units
  const handleApply = async () => {
    setStatus("applying");
    const response = await actionHandler(
      `compliance/bccr/accounts/${(formData as ApplyComplianceUnitsFormData)
        ?.bccr_holding_account_id}/compliance-report-versions/${complianceReportVersionId}/compliance-units`,
      "POST",
      "",
      {
        body: JSON.stringify(formData),
      },
    );
    if (!response || response.error) {
      setStatus("submitted");
      setErrors([response.error || "Failed to apply compliance units"]);
    } else {
      setStatus("applied");
      setErrors(undefined);
    }
  };

  // Check if we should show the Submit button (when trading name is received)
  const shouldShowSubmitButton = useMemo(() => {
    return status === "idle" || status === "submitting";
  }, [status]);

  // Check if Submit button should be enabled (when checkbox is checked)
  const canSubmit = useMemo(() => {
    const data = formData as ApplyComplianceUnitsFormData;
    const result = !!(shouldShowSubmitButton && data?.confirmation_checkbox);
    return result;
  }, [formData, shouldShowSubmitButton]);

  // Check if we should show the Apply button (after data is loaded)
  const shouldShowApplyButton = useMemo(() => {
    const data = formData as ApplyComplianceUnitsFormData;

    if (status === "applying") {
      return true;
    }

    const result = !!(
      status === "submitted" &&
      data?.bccr_units &&
      data?.bccr_units.length > 0
    );
    return result;
  }, [formData, status]);

  // Calculate compliance limit status for Apply button enablement
  const complianceLimitStatus = useMemo((): ComplianceLimitStatus => {
    const totalValue = (formData as ApplyComplianceUnitsFormData)
      .total_equivalent_value;
    // Compare against remaining cap (what's left); not original full cap
    let statusStr: ComplianceLimitStatus;
    if (totalValue > remainingCap) {
      statusStr = "EXCEEDS";
    } else if (totalValue === remainingCap) {
      statusStr = "EQUALS";
    } else {
      statusStr = "BELOW";
    }
    return statusStr;
  }, [formData, remainingCap]);

  // Check if Apply button should be enabled
  const canApply = useMemo(() => {
    const data = formData as ApplyComplianceUnitsFormData;
    const result = !!(
      shouldShowApplyButton &&
      data?.total_quantity_to_be_applied &&
      data?.total_quantity_to_be_applied > 0 &&
      complianceLimitStatus !== "EXCEEDS"
    );
    return result;
  }, [formData, shouldShowApplyButton, complianceLimitStatus]);

  // Select the appropriate schema based on current phase
  const currentSchema = useMemo(() => {
    switch (currentPhase) {
      case "confirmation":
        return applyComplianceUnitsConfirmationSchema;
      case "compliance_data":
        return applyComplianceUnitsDataSchema;
      default:
        return applyComplianceUnitsBaseSchema;
    }
  }, [currentPhase]);

  return (
    <FormBase
      readonly={status === "applied"}
      schema={currentSchema}
      uiSchema={createApplyComplianceUnitsUiSchema(operationName)}
      formData={formData}
      onChange={handleChange}
      onSubmit={handleSubmit}
      formContext={{
        reportingYear,
        chargeRate: (formData as ApplyComplianceUnitsFormData)?.charge_rate,
        validateBccrAccount: getBccrAccountDetails,
        complianceReportVersionId,
        onValidAccountResolved: (response?: BccrComplianceAccountResponse) => {
          if (response) {
            setFormData((prev: ApplyComplianceUnitsFormData) => ({
              ...prev,
              ...response,
            }));
            setCurrentPhase("confirmation");
          } else {
            setCurrentPhase("initial");
          }
        },
        onError: setErrors,
        complianceLimitStatus,
        isApplied: status === "applied",
      }}
      className="w-full min-h-[62vh] flex flex-col justify-between"
    >
      <div>
        {canApply && status !== "applied" && (
          <div className="mt-8">
            <ApplyComplianceUnitsAlertNote />
          </div>
        )}
        <FormAlerts errors={errors} />
        <ComplianceStepButtons
          backButtonText={status === "applied" ? "Back" : "Cancel"}
          onBackClick={() =>
            router.push(
              `/compliance-summaries/${complianceReportVersionId}/manage-obligation-review-summary`,
            )
          }
          className="mt-8"
        >
          {shouldShowSubmitButton && (
            <SubmitButton
              isSubmitting={status === "submitting"}
              disabled={!canSubmit}
            >
              Submit
            </SubmitButton>
          )}
          {shouldShowApplyButton && (
            <SubmitButton
              isSubmitting={status === "applying"}
              disabled={!canApply}
              onClick={handleApply}
              type="button"
            >
              Apply
            </SubmitButton>
          )}
        </ComplianceStepButtons>
      </div>
    </FormBase>
  );
}
