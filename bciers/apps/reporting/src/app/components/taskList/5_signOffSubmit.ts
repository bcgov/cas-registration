import { TaskListElement } from "@bciers/components/navigation/reportingTaskList/types";
import { getReportNeedsVerification } from "@reporting/src/app/utils/getReportNeedsVerification";

export enum ActivePage {
  "Verification" = 0,
  "Attachments",
  "FinalReview",
  "SignOff",
}
export const getSignOffAndSubmitSteps: (
  versionId: number,
  activeIndex?: ActivePage | number,
) => Promise<TaskListElement[]> = async (
  versionId,
  activeIndex = undefined,
) => {
  // Fetch needsVerification within the function
  const needsVerification = await getReportNeedsVerification(versionId);
  console.log(needsVerification);
  // Build the TaskListElement array
  const elements: TaskListElement[] = [
    {
      type: "Page", // Set the type to "Page"
      title: "Verification",
      link: `/reports/${versionId}/verification`,
      isActive: activeIndex === ActivePage.Verification,
    },
    {
      type: "Page", // Set the type to "Page"
      title: "Attachments",
      link: `/reports/${versionId}/attachments`,
      isActive: activeIndex === ActivePage.Attachments,
    },
    {
      type: "Page", // Set the type to "Page"
      title: "Final review",
      link: `/reports/${versionId}/final-review`,
      isActive: activeIndex === ActivePage.FinalReview,
    },
    {
      type: "Page", // Set the type to "Page"
      title: "Sign-off",
      link: `/reports/${versionId}/sign-off`,
      isActive: activeIndex === ActivePage.SignOff,
    },
  ];
  // Conditionally filter out "Verification" and "Attachments" based on needsVerification is false
  const filteredElements: TaskListElement[] = elements.filter((element) => {
    if (!needsVerification) {
      return (
        element.title !== "Verification" && element.title !== "Attachments"
      );
    }
    return true; // If needsVerification is true, keep all elements
  });
  return [
    {
      type: "Section",
      title: "Sign-off & submit",
      isExpanded: true,
      elements: filteredElements,
    },
  ];
};
