import { Page } from "playwright-core";
import { AppRoutes, ReportRoutes } from "../utils/enums";

export class FacilityReportPOM {
  readonly page: Page;

  private readonly baseUrl: string;
  readonly facilityId: string;

  constructor(page: Page, facilityId: string) {
    this.page = page;
    this.facilityId = facilityId;
    this.baseUrl = `${process.env.E2E_BASEURL}${AppRoutes.GRID_REPORTING_CURRENT_REPORTS}/
                    ${this.facilityId}/${ReportRoutes.FACILITY_REPORT_GRID}`;
  }

  // ... Here let's move all the facility specific methods from the current-report POM
}
