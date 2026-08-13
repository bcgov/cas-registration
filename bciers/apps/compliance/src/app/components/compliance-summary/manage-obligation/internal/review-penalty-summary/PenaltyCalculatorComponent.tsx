"use client";

import ComplianceStepButtons from "@/compliance/src/app/components/ComplianceStepButtons";
import { FormBase } from "@bciers/components/form";
import { IChangeEvent } from "@rjsf/core";
import { useMemo, useRef, useState } from "react";
import {
  createPenaltyCalculatorSchema,
  penaltyCalculatorUiSchema,
} from "@/compliance/src/app/data/jsonSchema/manageObligation/internal/PenaltyCalculatorSchema";
import { getPenaltyAccrualCalculationData } from "@/compliance/src/app/utils/getPenaltyAccrualCalculationData";

const penaltyCalculatorSchema = createPenaltyCalculatorSchema();

type PenaltyAccrualRow = {
  date?: string;
  daily_penalty?: string | number | null;
  daily_compounded?: string | number | null;
  accumulated_penalty?: string | number | null;
  accumulated_compounded?: string | number | null;
  interest_rate?: string | number | null;
};

type CalculatedPenaltyResponse = {
  penalty_type?: string;
  days_late?: number;
  total_penalty?: string | number | null;
  daily_accumulated_list?: PenaltyAccrualRow[];
};

type PenaltyCalculatorFormData = {
  penalty_type: string;
  final_day_of_penalty_accrual?: string;
  penalty_summary: {
    total_penalty_amount?: string | number | null;
    days_late?: number | string | null;
  };
  accrual_data: {
    tableData: Array<Array<string | number | null | undefined>>;
  };
};

const mapPenaltyTypeToFrontend = (penaltyType?: string): string => {
  if (penaltyType === "Late Submission") {
    return "ggeapar";
  }

  return "automatic_overdue";
};

interface Props {
  complianceReportVersionId: number;
  penaltyData?: CalculatedPenaltyResponse;
  initialPenaltyType: string;
  initialFinalDayOfPenaltyAccrual: string;
}

const normalizeDateString = (value?: string): string | null => {
  if (!value) {
    return null;
  }

  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return value;
  }

  const isoDateMatch = value.match(/^(\d{4}-\d{2}-\d{2})T/);
  if (isoDateMatch?.[1]) {
    return isoDateMatch[1];
  }

  return null;
};

const mapApiDataToFormData = (
  data: CalculatedPenaltyResponse | undefined,
  penaltyType: string,
  finalDay: string,
): PenaltyCalculatorFormData => {
  const accrualRows = (data?.daily_accumulated_list ?? []).map((row) => [
    row.date,
    row.daily_penalty,
    row.daily_compounded,
    row.accumulated_penalty,
    row.accumulated_compounded,
    row.interest_rate,
  ]);

  return {
    penalty_type: penaltyType,
    final_day_of_penalty_accrual: finalDay,
    penalty_summary: {
      total_penalty_amount: data?.total_penalty,
      days_late: data?.days_late,
    },
    accrual_data: {
      tableData: accrualRows,
    },
  };
};

export default function PenaltyCalculatorComponent({
  complianceReportVersionId,
  penaltyData,
  initialPenaltyType,
  initialFinalDayOfPenaltyAccrual,
}: Readonly<Props>) {
  const backUrl = `/compliance-administration/compliance-summaries/${complianceReportVersionId}/review-penalty-summary`;
  const derivedPenaltyType =
    initialPenaltyType ?? mapPenaltyTypeToFrontend(penaltyData?.penalty_type);

  const initialFormData = useMemo(
    () =>
      mapApiDataToFormData(
        penaltyData,
        derivedPenaltyType,
        initialFinalDayOfPenaltyAccrual,
      ),
    [penaltyData, derivedPenaltyType, initialFinalDayOfPenaltyAccrual],
  );

  const [formData, setFormData] =
    useState<PenaltyCalculatorFormData>(initialFormData);
  const lastRequestIdRef = useRef(0);

  const handleChange = async (e: IChangeEvent<PenaltyCalculatorFormData>) => {
    const nextFormData = e.formData;
    if (!nextFormData) {
      return;
    }

    setFormData(nextFormData);

    const selectedPenaltyType = nextFormData?.penalty_type;
    const selectedFinalDay = nextFormData?.final_day_of_penalty_accrual ?? "";
    const normalizedFinalDay = normalizeDateString(selectedFinalDay);

    if (!selectedPenaltyType || !normalizedFinalDay) {
      return;
    }

    const requestId = Date.now();
    lastRequestIdRef.current = requestId;

    const refreshedPenaltyData = await getPenaltyAccrualCalculationData(
      complianceReportVersionId,
      {
        penalty_type: selectedPenaltyType,
        final_day_of_penalty_accrual: normalizedFinalDay,
      },
    );

    if (lastRequestIdRef.current !== requestId) {
      return;
    }

    setFormData(
      mapApiDataToFormData(
        refreshedPenaltyData,
        selectedPenaltyType,
        normalizedFinalDay,
      ),
    );
  };

  return (
    <FormBase
      schema={penaltyCalculatorSchema}
      uiSchema={penaltyCalculatorUiSchema}
      formData={formData}
      onChange={handleChange}
      className="w-full"
    >
      <ComplianceStepButtons backUrl={backUrl} />
    </FormBase>
  );
}
