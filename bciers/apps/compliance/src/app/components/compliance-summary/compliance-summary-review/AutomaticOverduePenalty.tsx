"use client";
import { TitleRow } from "./TitleRow";
import { AutomaticOverduePenaltyAlertNote } from "@/compliance/src/app/components/compliance-summary/compliance-summary-review/AutomaticOverduePenaltyAlertNote";
import { InfoRow } from "./InfoRow";

interface AutomaticOverduePenaltyProps {
  data: any;
}

export const AutomaticOverduePenalty = ({
  data,
}: AutomaticOverduePenaltyProps) => {
  // Use data from props

  return (
    <div style={{ width: "100%", marginBottom: "50px" }}>
      <TitleRow label="Automatic Overdue Penalty (as of Today):" />

      {/* Alert Note */}
      <AutomaticOverduePenaltyAlertNote />

      {/* Penalty Information Table */}
      <InfoRow label="Penalty Status:" value={data.penalty_status} />
      <InfoRow label="Penalty Type:" value={data.penalty_type} />
      <InfoRow
        label="Penalty Rate (Daily):"
        value={`${data.penalty_rate_daily}%`}
      />
      <InfoRow label="Days Late:" value={data.days_late} />
      <InfoRow
        label="Accumulated Penalty:"
        value={`$${data.accumulated_penalty}`}
      />
      <InfoRow
        label="Accumulated Compounding:"
        value={`$${data.accumulated_compounding}`}
      />
      <InfoRow
        label="Penalty (as of Today):"
        value={`$${data.penalty_today}`}
      />
      <InfoRow
        label="FAA Interest (as of Today):"
        value={`$${data.faa_interest}`}
      />
      <InfoRow
        label="Total Amount (as of Today):"
        value={`$${data.total_amount}`}
      />
    </div>
  );
};
