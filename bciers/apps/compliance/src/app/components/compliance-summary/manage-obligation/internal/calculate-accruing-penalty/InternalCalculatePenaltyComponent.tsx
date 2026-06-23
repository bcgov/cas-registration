"use client";

import ComplianceStepButtons from "@/compliance/src/app/components/ComplianceStepButtons";
import { useMemo, useState, useEffect } from "react";
import { ComplianceSummary } from "@/compliance/src/app/types";
import { PenaltyStatus } from "@bciers/utils/src/enums";
import dayjs, { Dayjs } from "dayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import PenaltyAccrualTable from "./PenaltyAccrualTable";

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

  useEffect(() => {
    async function fetchPenaltyData(){
      const result = await calculatePenalty(1, "Automatic Overdue", endDate)
      setPenaltyData(result)
    }

    fetchPenaltyData()
}, [endDate]);

  const handleChange = async (d: Dayjs) => {
    setEndDate(d.utc().format("YYYY-MM-DD"));
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
  
  const currencyFormatter = new Intl.NumberFormat('en-US', {
    style: 'decimal',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return (
    <>
      <div>
        <h1>PENALTY CALCULATOR</h1>
        <h4>Pick a date for the last day of the penalty</h4>
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
      <hr/>
      <div>
        <hr/>
        <p><strong>Penalty Amount:</strong> ${currencyFormatter.format(penaltyData?.total_penalty)}</p>
        <p><strong>Days Late:</strong> {penaltyData?.days_late}</p>
        <hr/>
      </div>
      <hr/>
      {penaltyData?.daily_accumulated_list && (
        <div>
          <h3>Accrual Data</h3>
        <PenaltyAccrualTable accrualData={penaltyData?.daily_accumulated_list}/>
        </div>
      )}
      <ComplianceStepButtons backUrl={backUrl} continueUrl={continueUrl} />
    </>
  );
}
