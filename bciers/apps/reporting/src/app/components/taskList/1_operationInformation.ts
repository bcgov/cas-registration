import { TaskListElement } from "@bciers/components/navigation/reportingTaskList/types";
import { ReportingFlow } from "./types";
import { ReportingPage } from "./pageList";

export const getOperationInformationTaskList: (
  versionId: number,
  flow: ReportingFlow,
  activePage: ReportingPage
) => TaskListElement[] = (
  versionId,flow,activePage
) => {

  const elements = [
    {
      element:
      {
        type: "Page",
        title: "Review operation information",
        link: `/reports/${versionId}/review-operator-data`,
        isActive: activePage === ReportingPage.ReviewOperatorInfo,
      },
      
    },
    {
      element:{
        type: "Page",
        title: "Person responsible",
        link: `/reports/${versionId}/person-responsible`,
        isActive: activePage === ReportingPage.PersonResponsible,
      }
    },
    {
      flows: [ReportingFlow.LFO, ReportingFlow.ReportingOnlyLFO, ReportingFlow.SimpleReport],
      element: {
        type: "Page",
        title: "Review facilities",
        link: `/reports/${versionId}/facilities/review-facilities`,
        isActive: activePage === ReportingPage.ReviewFacilities,
      }
    }
  ]



  return [
    {
      type: "Section",
      title: "Operation information",
      isExpanded: true,
      elements: elements,
    },
  ];
};
