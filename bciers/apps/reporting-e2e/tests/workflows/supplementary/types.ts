import { FacilityIDs } from "@/reporting-e2e/utils/enums";
import { WorkflowRunnerArgs } from "@bciers/e2e/utils/types";

export type SupplementaryScenario = {
  title: string;
  operationName: string;
  facilityId: FacilityIDs;
  isRegulated: boolean;
  /** Each edit is asserted as carried over, then as reported on Review Changes. */
  edits: {
    emission: { carriedOver: number; updated: number };
    production: { productIndex: number; carriedOver: number; updated: number };
    /** "other" makes the description mandatory */
    methodology: { carriedOver: string; updated: string; description: string };
  };
  /** Expected report history rows, newest first */
  expectedVersions: string[];
};

/** LFO reports add facility-level navigation on top of the shared scenario shape. */
export type LfoSupplementaryScenario = SupplementaryScenario & {
  facilityName: string;
};

export type SupplementaryScenarioArgs<
  T extends SupplementaryScenario = SupplementaryScenario,
> = WorkflowRunnerArgs & {
  scenario: T;
};
