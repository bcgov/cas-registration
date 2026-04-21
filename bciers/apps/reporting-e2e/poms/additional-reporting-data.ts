import { Page } from "@playwright/test";
import {
  assertFieldVisibility,
  fillComboxboxWidget,
  fillInputValueByLocator,
} from "@bciers/e2e/utils/helpers";

const ADDITIONAL_REPORTING_DATA = {
  PAGE_TITLE: "Additional Reporting Data",

  CAPTURE_EMISSIONS_SECTION_TITLE: "Captured Emissions (If applicable)",
  CAPTURE_EMISSIONS_INFO_NOTE:
    "Captured emissions means the emissions that otherwise would be released into the atmosphere, that is captured instead for further applications such as geological deposit and as an industrial material.",
  CAPTURE_EMISSIONS_LABEL: "Did you capture emissions?",

  CAPTURE_TYPE_LABEL: "Capture type",
  CAPTURE_TYPE_VALUE: "On-site use",

  EMISSIONS_ON_SITE_USE_INPUT_NAME: "emissions_on_site_use",
  EMISSIONS_ON_SITE_USE_VALUE: 100,

  ADDITIONAL_DATA_SECTION_TITLE: "Additional data",
  ELECTRICITY_GENERATED_INPUT_NAME: "electricity_generated",
  ELECTRICITY_GENERATED_VALUE: 0,
} as const;

export class AdditionalReportingDataPOM {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async fill(): Promise<void> {
    await assertFieldVisibility(
      this.page,
      [
        ADDITIONAL_REPORTING_DATA.PAGE_TITLE,
        ADDITIONAL_REPORTING_DATA.CAPTURE_EMISSIONS_SECTION_TITLE,
        ADDITIONAL_REPORTING_DATA.CAPTURE_EMISSIONS_INFO_NOTE,
        ADDITIONAL_REPORTING_DATA.CAPTURE_EMISSIONS_LABEL,
      ],
      true,
    );

    const yesLabel = this.page.locator("label").filter({ hasText: /^Yes$/ });
    await yesLabel.click();

    await fillComboxboxWidget(
      this.page,
      ADDITIONAL_REPORTING_DATA.CAPTURE_TYPE_LABEL,
      ADDITIONAL_REPORTING_DATA.CAPTURE_TYPE_VALUE,
    );

    await fillInputValueByLocator(
      this.page.getByRole("textbox", {
        name: ADDITIONAL_REPORTING_DATA.EMISSIONS_ON_SITE_USE_INPUT_NAME,
      }),
      ADDITIONAL_REPORTING_DATA.EMISSIONS_ON_SITE_USE_VALUE,
    );

    await assertFieldVisibility(
      this.page,
      [ADDITIONAL_REPORTING_DATA.ADDITIONAL_DATA_SECTION_TITLE],
      true,
    );
    await fillInputValueByLocator(
      this.page.getByRole("textbox", {
        name: ADDITIONAL_REPORTING_DATA.ELECTRICITY_GENERATED_INPUT_NAME,
      }),
      ADDITIONAL_REPORTING_DATA.ELECTRICITY_GENERATED_VALUE,
    );
  }
}
