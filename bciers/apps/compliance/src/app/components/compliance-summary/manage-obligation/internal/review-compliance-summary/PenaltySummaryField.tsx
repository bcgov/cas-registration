"use client";

import { formatMonetaryValue } from "@/compliance/src/app/utils/formatting";

type PenaltySummaryValue = {
  total_penalty_amount: string;
  days_late: number;
};

type PenaltySummaryFieldProps = {
  formData?: PenaltySummaryValue;
  label?: string;
};

const tileStyles =
  "w-[350px] shrink-0 rounded-md border border-solid border-current p-4";

export const PenaltySummaryField = ({
  formData,
  label,
}: PenaltySummaryFieldProps) => (
  <div className="w-full">
    <p className="mb-2 text-bc-bg-blue">{label ?? "Penalty summary"}</p>
    <div className="flex w-full flex-nowrap gap-4">
      <div className={`${tileStyles} bg-red-50 text-bc-error-red`}>
        <p className="text-sm font-medium">Total penalty amount</p>
        <p className="mt-1 text-2xl font-bold">
          {formatMonetaryValue(Number(formData?.total_penalty_amount ?? 0))}
        </p>
      </div>
      <div className={`${tileStyles} bg-bc-white text-bc-bg-blue`}>
        <p className="text-sm font-medium">Days late</p>
        <p className="mt-1 text-2xl font-bold">{formData?.days_late ?? 0}</p>
      </div>
    </div>
  </div>
);
