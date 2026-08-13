"use client";

type PenaltySummaryValue = {
  total_penalty_amount?: string | number | null;
  days_late?: string | number | null;
};

const getDisplayValue = (value: string | number | null | undefined): string => {
  if (value === null || value === undefined || value === "") {
    return "-";
  }
  return String(value);
};

const getFormattedPenaltyAmount = (
  value: string | number | null | undefined,
): string => {
  if (value === null || value === undefined || value === "") {
    return "-";
  }

  const numericValue = Number(String(value).replace(/,/g, ""));
  if (Number.isNaN(numericValue)) {
    return String(value);
  }

  return numericValue.toLocaleString("en-CA", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

type PenaltySummaryFieldProps = {
  formData?: PenaltySummaryValue;
  label?: string;
};

export const PenaltySummaryField = ({
  formData,
  label,
}: PenaltySummaryFieldProps) => {
  const summary = (formData ?? {}) as PenaltySummaryValue;
  const totalPenaltyAmount = getFormattedPenaltyAmount(
    summary.total_penalty_amount,
  );
  const daysLate = getDisplayValue(summary.days_late);

  return (
    <div className="w-full">
      <p className="mb-2 text-bc-bg-blue">{label ?? "Penalty summary"}</p>
      <div className="flex w-full flex-nowrap gap-4">
        <div
          style={{
            width: "350px",
            minWidth: "350px",
            maxWidth: "350px",
            borderWidth: "1px",
            borderStyle: "solid",
            borderColor: "currentColor",
          }}
          className="rounded-md bg-red-50 p-4 text-bc-error-red"
        >
          <p className="text-sm font-medium">Total penalty amount</p>
          <p className="mt-1 text-2xl font-bold">{totalPenaltyAmount}</p>
        </div>
        <div
          style={{
            width: "350px",
            minWidth: "350px",
            maxWidth: "350px",
            borderWidth: "1px",
            borderStyle: "solid",
            borderColor: "currentColor",
          }}
          className="rounded-md bg-white p-4 text-bc-bg-blue"
        >
          <p className="text-sm font-medium">Days late</p>
          <p className="mt-1 text-2xl font-bold">{daysLate}</p>
        </div>
      </div>
    </div>
  );
};
