"use client";

import ComplianceStepButtons from "@/compliance/src/app/components/ComplianceStepButtons";
import { useMemo, useState, useEffect } from "react";
import { ComplianceSummary } from "@/compliance/src/app/types";
import { PenaltyStatus } from "@bciers/utils/src/enums";
import dayjs, { Dayjs } from "dayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";

interface Props {
  data: ComplianceSummary;
  complianceReportVersionId: number;
  calculatePenalty: (
    obligationId: number,
    penaltyType: string,
    endDate: string,
  ) => any;
}

export function InternalCalculatePenaltyComponent({
  data,
  complianceReportVersionId,
  calculatePenalty,
}: Readonly<Props>) {
  const backUrl = "/compliance-administration/compliance-summaries";
  const today = new Date().toLocaleDateString("en-CA");
  const [endDate, setEndDate] = useState(today);
  const [penaltyData, setPenaltyData] = useState({});

  const handleChange = async (d: Dayjs) => {
    setEndDate(d.utc().format("YYYY-MM-DD"));

    const data = await calculatePenalty(1, "Automatic Overdue", "2026-06-01");
    console.log(data);
    setPenaltyData(data);
  };

  const {
    reporting_year: reportingYear,
    has_late_submission_penalty: hasLateSubmissionPenalty,
    penalty_status: penaltyStatus,
    outstanding_balance_tco2e: outstandingBalance,
  } = data;

  const showPenalty =
    Number(outstandingBalance) === 0 &&
    [PenaltyStatus.NOT_PAID, PenaltyStatus.PAID].includes(
      penaltyStatus as PenaltyStatus,
    );

  const continueUrl = hasLateSubmissionPenalty
    ? `/compliance-administration/compliance-summaries/${complianceReportVersionId}/review-interest-summary`
    : showPenalty
      ? `/compliance-administration/compliance-summaries/${complianceReportVersionId}/review-penalty-summary`
      : undefined;

  return (
    <>
      <div>
        <h1>Calculate the Penalty Holmes! </h1>
      </div>
      <div>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DatePicker
            value={dayjs(endDate)}
            onChange={handleChange}
            format="YYYY-MM-DD"
          />
        </LocalizationProvider>
      </div>
      <div>
        <p>Penalty Amount: {penaltyData?.total_penalty}</p>
      </div>
      <ComplianceStepButtons backUrl={backUrl} continueUrl={continueUrl} />
    </>
  );
}
