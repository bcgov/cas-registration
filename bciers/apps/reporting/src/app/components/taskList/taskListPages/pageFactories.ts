import { ReportingPage, TaskListPageFactory } from "../types";
import { operationInformationPageFactories } from "./1_operationInformation";
import { facilitiesInformationPageFactories } from "./2_facilitiesInformation";
import { eioInformationPageFactories } from "./2_eioInformation";
import { additionalInformationPageFactories } from "./3_additionalInformation";
import { complianceSummaryPageFactories } from "./4_complianceSummary";
import { signOffSubmitPageFactories } from "./5_signOffSubmit";

export const pageFactories: {
  [Page in ReportingPage]?: TaskListPageFactory;
} = {
  ...operationInformationPageFactories,
  ...facilitiesInformationPageFactories,
  ...eioInformationPageFactories,
  ...additionalInformationPageFactories,
  ...complianceSummaryPageFactories,
  ...signOffSubmitPageFactories,
};
