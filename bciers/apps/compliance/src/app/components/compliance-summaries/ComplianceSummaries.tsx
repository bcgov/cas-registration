"use client";

import { ComplianceSummary } from "./types";
import ComplianceSummariesDataGrid from "./ComplianceSummariesDataGrid";

interface Props {
  initialData: {
    rows: ComplianceSummary[];
    row_count: number;
  };
}

export default function ComplianceSummaries({ initialData }: Props) {
  if (!initialData) {
    return <div>No compliance summaries data in database.</div>;
  }

  return <ComplianceSummariesDataGrid initialData={initialData} />;
}
