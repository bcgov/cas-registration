import { Page } from "playwright-core";
import { AppRoutes, ReportRoutes } from "../utils/enums";

export class SFOFacilityReportPOM {
  readonly page: Page;
  readonly facilityId: string;

  constructor(page: Page, facilityId: string) {
    this.page = page;
    this.facilityId = facilityId;
  }

  // -----------------
  // Page 3 — Activities (GSC excluding line tracing)
  // -----------------

  async fillGscActivity(): Promise<void> {}

  // -----------------
  // Page 4 — Non-Attributable Emissions
  // -----------------

  async fillNonAttributable(): Promise<void> {}

  // -----------------
  // Page 5 — Emission Summary (read-only)
  // -----------------

  async continueFromEmissionSummary(): Promise<void> {}

  // -----------------
  // Page 6 — Production Data
  // -----------------

  async fillProductionData(): Promise<void> {}

  // -----------------
  // Page 7 — Allocation of Emissions
  // -----------------

  async fillAllocationOfEmissions(): Promise<void> {}
}

export class LFOFacilityReportPOM extends SFOFacilityReportPOM {
  private readonly gridUrl: string;

  constructor(page: Page, facilityId: string) {
    super(page, facilityId);
    this.gridUrl = `${process.env.E2E_BASEURL}${AppRoutes.GRID_REPORTING_CURRENT_REPORTS}/
                    ${this.facilityId}/${ReportRoutes.FACILITY_REPORT_GRID}`;
  }

  // -----------------
  // Page 1 — Facility specific information
  // -----------------

  async fillReviewFacilityInformation(): Promise<void> {}
}
