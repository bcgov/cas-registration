"use client";

import { useMemo, useRef, useState } from "react";
import { IChangeEvent } from "@rjsf/core";
import { FormBase } from "@bciers/components/form";
import AlertNote from "@bciers/components/form/components/AlertNote";
import ComplianceStepButtons from "@/compliance/src/app/components/ComplianceStepButtons";
import {
  penaltyCalculatorSchema,
  createPenaltyCalculatorUiSchema,
} from "@/compliance/src/app/data/jsonSchema/manageObligation/internal/PenaltyCalculatorSchema";
import { getPenaltyAccrualCalculationData } from "@/compliance/src/app/utils/getPenaltyAccrualCalculationData";
import {
  CalculatedPenalty,
  PenaltyType,
  PenaltyTypeStatus,
} from "@/compliance/src/app/types";
import { PenaltyCalculatorFormData } from "./types";

const GGEAPAR_NOT_APPLICABLE_MESSAGE =
  "GGEAPAR interest only applies to obligations for supplementary compliance reports.";

const STATUS_LABELS: Record<PenaltyTypeStatus, string> = {
  [PenaltyTypeStatus.NONE]: "None",
  [PenaltyTypeStatus.ACCRUING]: "Accruing",
  [PenaltyTypeStatus.PAID]: "Paid",
  [PenaltyTypeStatus.NOT_PAID]: "Not paid",
  [PenaltyTypeStatus.NOT_APPLICABLE]: "Not applicable",
};

const isCompleteDate = (value?: string): boolean =>
  /^\d{4}-\d{2}-\d{2}$/.test(value ?? "");

const buildQueryId = (penaltyType: PenaltyType, endDate: string) =>
  `${penaltyType}-${endDate}`;

type PenaltyResult = {
  penalty: CalculatedPenalty;
  queryId: string;
};

const toFormData = (
  result: PenaltyResult,
  penaltyType: PenaltyType,
  finalDay: string,
): PenaltyCalculatorFormData => ({
  automatic_overdue_penalty_status:
    STATUS_LABELS[result.penalty.automatic_overdue_penalty_status],
  ggeapar_interest_status:
    STATUS_LABELS[result.penalty.ggeapar_interest_status],
  requested_penalty_type: penaltyType,
  final_day_of_penalty_accrual: finalDay,
  penalty_summary: {
    total_penalty_amount: result.penalty.total_penalty,
    days_late: result.penalty.days_late,
  },
  accrual_data: {
    query_id: result.queryId,
    rows: result.penalty.daily_accumulated_list,
  },
});

interface Props {
  complianceReportVersionId: number;
  penaltyData: CalculatedPenalty;
  finalDayOfPenaltyAccrual: string;
}

export default function PenaltyCalculatorComponent({
  complianceReportVersionId,
  penaltyData,
  finalDayOfPenaltyAccrual,
}: Readonly<Props>) {
  const backUrl = `/compliance-administration/compliance-summaries/${complianceReportVersionId}/review-compliance-obligation-report`;

  const [result, setResult] = useState<PenaltyResult>(() => ({
    penalty: penaltyData,
    queryId: buildQueryId(penaltyData.penalty_type, finalDayOfPenaltyAccrual),
  }));
  const [penaltyType, setPenaltyType] = useState<PenaltyType>(
    penaltyData.penalty_type,
  );
  const [finalDay, setFinalDay] = useState(finalDayOfPenaltyAccrual);
  const latestRequestIdRef = useRef(0);

  const uiSchema = createPenaltyCalculatorUiSchema();

  const formData = useMemo(
    () => toFormData(result, penaltyType, finalDay),
    [result, penaltyType, finalDay],
  );

  const handleChange = async (
    event: IChangeEvent<PenaltyCalculatorFormData>,
  ) => {
    const nextFormData = event.formData;
    if (!nextFormData) return;

    const nextPenaltyType = nextFormData.requested_penalty_type;
    const nextFinalDay = nextFormData.final_day_of_penalty_accrual;

    setPenaltyType(nextPenaltyType);
    setFinalDay(nextFinalDay);

    if (!nextPenaltyType || !isCompleteDate(nextFinalDay)) return;

    const requestId = ++latestRequestIdRef.current;
    const penalty = await getPenaltyAccrualCalculationData(
      complianceReportVersionId,
      { requested_penalty_type: nextPenaltyType, end_date: nextFinalDay },
    );

    // Requests can land out of order, so an earlier one must not overwrite a later.
    if (latestRequestIdRef.current !== requestId) return;

    setResult({
      penalty,
      queryId: buildQueryId(nextPenaltyType, nextFinalDay),
    });
  };

  const isGgeaparNotApplicable =
    penaltyType === PenaltyType.LATE_SUBMISSION &&
    result.penalty.ggeapar_interest_status === PenaltyTypeStatus.NOT_APPLICABLE;

  return (
    <>
      {isGgeaparNotApplicable && (
        <AlertNote alertType="ALERT">
          {GGEAPAR_NOT_APPLICABLE_MESSAGE}
        </AlertNote>
      )}
      <FormBase
        schema={penaltyCalculatorSchema}
        uiSchema={uiSchema}
        formData={formData}
        onChange={handleChange}
        className="w-full"
      >
        <ComplianceStepButtons backUrl={backUrl} />
      </FormBase>
    </>
  );
}
