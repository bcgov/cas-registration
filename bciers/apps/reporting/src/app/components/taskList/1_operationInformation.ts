import { TaskListElement } from "@bciers/components/navigation/reportingTaskList/types";

/**
 *
 * @param versionId Int. The version ID
 * @param facilityId UUID. If applicable, the facility ID. A 'null' facility ID means the operation is an LFO
 * @returns The list of tasklist elements for the 'operation information' reporting step
 */
export const getOperationInformationTaskList: (
  versionId: number,
  facilityId: string | null,
) => TaskListElement[] = (versionId, facilityId = null) => {
  return [
    {
      type: "Section",
      title: "Operation information",
      isExpanded: true,
      elements: [
        {
          type: "Page",
          title: "Review Operation information",
          link: `/reporting/reports/${versionId}/review-operator-data`,
        },
        {
          type: "Page",
          title: "Person responsible",
          link: `/reporting/reports/${versionId}/person-responsible`,
        },
        {
          type: "Page",
          title: "Review facilities",
          link: facilityId
            ? `/reports/${versionId}/facilities/${facilityId}/review`
            : `/reports/${versionId}/facilities/lfo-facilities`,
        },
      ],
    },
  ];
};
