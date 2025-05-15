import { ComplianceSummary } from "./types";
import ComplianceSummariesDataGrid from "./ComplianceSummariesDataGrid";

interface Props {
  initialData: {
    rows: ComplianceSummary[];
    row_count: number;
  };
}

export default function ComplianceSummaries({ initialData }: Props) {
  return <ComplianceSummariesDataGrid initialData={initialData} />;
}
