import { TaskListElement } from "@bciers/components/navigation/reportingTaskList/types";

export const generateNoObligationNoCreditsTaskList: (
  complianceReportVersionId: number,
  reporting_year: number,
) => TaskListElement[] = (complianceReportVersionId, reportingYear) => {
  return [
    {
      type: "Section",
      title: `${reportingYear} Compliance Summary`,
      isExpanded: true,
      elements: [
        {
          type: "Page" as const,
          title: `Review ${reportingYear} Compliance Report`,
          link: `/compliance-summaries/${complianceReportVersionId}/review-summary`,
          isActive: true,
        },
      ],
    },
  ];
};
