"use client";

import ComplianceStepButtons from "@/compliance/src/app/components/ComplianceStepButtons";
import { FormBase } from "@bciers/components/form";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import {
  applyComplianceUnitsSchema,
  applyComplianceUnitsUiSchema,
} from "@/compliance/src/app/data/jsonSchema/manageObligation/applyComplianceUnitsSchema";
import { getBccrComplianceUnitsAccountDetails } from "@/compliance/src/app/utils/bccrAccountHandlers";
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

interface ApplyComplianceUnitsComponentProps {
  complianceSummaryId: string;
}

export type ComplianceLimitStatus = "EXCEEDS" | "EQUALS" | "BELOW";

export default function ApplyComplianceUnitsComponent({
  complianceSummaryId,
}: Readonly<ApplyComplianceUnitsComponentProps>) {
  const router = useRouter();
  const [formData, setFormData] = useState<ApplyComplianceUnitsFormData | {}>(
    {},
  );
  const [errors, setErrors] = useState<string[] | undefined>();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  // Keep track of the initial outstanding balance from the API
  const [initialOutstandingBalance, setInitialOutstandingBalance] =
    useState<number>(0);

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
      return;
    }

    // Calculate summary values if we have units
    if (
      newFormData &&
      Array.isArray(newFormData.bccr_units) &&
      newFormData.bccr_units.length > 0
    ) {
      const summaryValues = calculateSummaryValues(
        newFormData.charge_rate,
        newFormData.bccr_units,
      );

      setFormData({
        ...newFormData,
        ...summaryValues,
      });
    } else {
      setFormData({
        ...newFormData,
      });
    }
  };

  const handleSubmit = async (
    e: IChangeEvent<ApplyComplianceUnitsFormData>,
  ) => {
    setIsSubmitting(true);
    const response = await actionHandler(
      `compliance/bccr/accounts/${e.formData?.bccr_holding_account_id}/compliance-report-versions/${complianceSummaryId}/compliance-units`,
      "POST",
      "",
      {
        body: JSON.stringify(e.formData),
      },
    );
    setIsSubmitting(false);
    if (!response || response.error) {
      setErrors([response.error || "Failed to apply compliance units"]);
    } else {
      setIsSubmitted(true);
      setErrors(undefined);
    }
  };

  // Check if the selected units exceed or equal 50% of the initial outstanding balance
  const complianceLimitStatus = useMemo((): ComplianceLimitStatus => {
    const totalValue = (formData as ApplyComplianceUnitsFormData)
      .total_equivalent_value;
    const limit = initialOutstandingBalance * 0.5;

    if (totalValue > limit) {
      return "EXCEEDS";
    } else if (totalValue === limit) {
      return "EQUALS";
    }
    return "BELOW";
  }, [formData, initialOutstandingBalance]);

  const canSubmit = useMemo(() => {
    return !!(
      (formData as ApplyComplianceUnitsFormData)?.bccr_holding_account_id &&
      (formData as ApplyComplianceUnitsFormData)
        ?.total_quantity_to_be_applied &&
      (formData as ApplyComplianceUnitsFormData)?.total_quantity_to_be_applied >
        0 &&
      complianceLimitStatus !== "EXCEEDS"
    );
  }, [formData, complianceLimitStatus]);

  return (
    <FormBase
      readonly={isSubmitted}
      schema={applyComplianceUnitsSchema}
      uiSchema={applyComplianceUnitsUiSchema}
      formData={formData}
      onChange={handleChange}
      onSubmit={handleSubmit}
      formContext={{
        chargeRate: (formData as ApplyComplianceUnitsFormData)?.charge_rate,
        validateBccrAccount: (accountId: string) =>
          getBccrComplianceUnitsAccountDetails(accountId, complianceSummaryId),
        onValidAccountResolved: (response?: BccrComplianceAccountResponse) => {
          if (response?.outstanding_balance) {
            setInitialOutstandingBalance(response.outstanding_balance);
          }
          setFormData((prev: ApplyComplianceUnitsFormData) => ({
            ...prev,
            ...response,
          }));
        },
        onError: setErrors,
        complianceLimitStatus,
        isSubmitted,
      }}
      className="w-full min-h-[62vh] flex flex-col justify-between"
    >
      <div>
        {canSubmit && !isSubmitted && (
          <div className="mt-8">
            <ApplyComplianceUnitsAlertNote />
          </div>
        )}
        <FormAlerts errors={errors} />
        <ComplianceStepButtons
          backButtonText={isSubmitted ? "Back" : "Cancel"}
          onBackClick={() =>
            router.push(
              `/compliance-summaries/${complianceSummaryId}/manage-obligation-review-summary`,
            )
          }
          className="mt-8"
        >
          {!isSubmitted && (
            <SubmitButton isSubmitting={isSubmitting} disabled={!canSubmit}>
              Apply
            </SubmitButton>
          )}
        </ComplianceStepButtons>
      </div>
    </FormBase>
  );
}
