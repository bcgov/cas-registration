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

interface ApplyComplianceUnitsComponentProps {
  complianceSummaryId: any;
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
    // @ts-expect-error - formData is {} when the form is first rendered
    const prevAccountId = formData?.bccr_holding_account_id;
    const newAccountId = newFormData?.bccr_holding_account_id;

    // If account ID changed and is not 15 digits, clear everything except the account ID
    if (
      prevAccountId !== newAccountId &&
      (!newAccountId || newAccountId.length !== 15)
    ) {
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

  const handleSubmit = (e: IChangeEvent<ApplyComplianceUnitsFormData>) => {
    // TODO: Implement submit logic in ticket 161
    console.log(e.formData);
    setIsSubmitted(true);
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
    return (
      "bccr_trading_name" in formData &&
      "total_quantity_to_be_applied" in formData &&
      (formData as ApplyComplianceUnitsFormData).total_quantity_to_be_applied >
        0 &&
      complianceLimitStatus !== "EXCEEDS" &&
      (!errors || errors.length === 0)
    );
  }, [formData, errors, complianceLimitStatus]);

  return (
    <FormBase
      readonly={isSubmitted}
      schema={applyComplianceUnitsSchema}
      uiSchema={applyComplianceUnitsUiSchema}
      formData={formData}
      onChange={handleChange}
      onSubmit={handleSubmit}
      formContext={{
        // @ts-expect-error - formData is {} when the form is first rendered
        chargeRate: formData?.charge_rate,
        validateBccrAccount: (accountId: string) =>
          getBccrComplianceUnitsAccountDetails(accountId, complianceSummaryId),
        onValidAccountResolved: (response?: BccrComplianceAccountResponse) => {
          if (response?.outstanding_balance) {
            setInitialOutstandingBalance(response.outstanding_balance);
          }
          setFormData((prev: any) => ({
            ...prev,
            ...response,
          }));
        },
        onError: setErrors,
        complianceLimitStatus,
        exceedsLimit: complianceLimitStatus === "EXCEEDS",
        isSubmitted,
      }}
      className="w-full min-h-[62vh] flex flex-col justify-between"
    >
      <div>
        <FormAlerts errors={errors} />
        {canSubmit && (
          <div className="mt-8">
            <ApplyComplianceUnitsAlertNote />
          </div>
        )}
        <ComplianceStepButtons
          backButtonText="Cancel"
          continueButtonText="Apply"
          onBackClick={() =>
            router.push(
              `/compliance-summaries/${complianceSummaryId}/manage-obligation-review-summary`,
            )
          }
          onContinueClick={isSubmitted ? undefined : () => {}}
          continueButtonType="submit"
          middleButtonDisabled={false}
          submitButtonDisabled={!canSubmit}
          className="mt-4"
        />
      </div>
    </FormBase>
  );
}
