import { ReportingFlow } from "./types";

export const flowHelpers = (flow: ReportingFlow) => {
  return {
    isEIO: flow === ReportingFlow.EIO,
    isLFO: [
      ReportingFlow.LFO,
      ReportingFlow.ReportingOnlyLFO,
      ReportingFlow.NewEntrantLFO,
      ReportingFlow.PotentialReportingLFO,
      ReportingFlow.OptedInLFO,
    ].includes(flow),
    isSFO: [
      ReportingFlow.SFO,
      ReportingFlow.ReportingOnlySFO,
      ReportingFlow.NewEntrantSFO,
      ReportingFlow.PotentialReportingSFO,
      ReportingFlow.OptedInSFO,
    ].includes(flow),
    isReportingOnly: [
      ReportingFlow.ReportingOnlySFO,
      ReportingFlow.ReportingOnlyLFO,
    ].includes(flow),
    isNewEntrant: [
      ReportingFlow.NewEntrantSFO,
      ReportingFlow.NewEntrantLFO,
    ].includes(flow),
    isSFOReportingOnly: flow === ReportingFlow.ReportingOnlySFO,
  };
};
