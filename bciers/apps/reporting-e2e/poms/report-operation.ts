import { Page, expect } from "@playwright/test";
import {
  assertFieldVisibility,
  checkFormFieldsReadOnly,
} from "@bciers/e2e/utils/helpers";

const OPERATION_INFO_FIELDS = {
  // Field labels
  REPORT_TYPE_LABEL:
    "Select what type of report you are filling. If you are uncertain about which report type your operation should complete, please contact GHGRegulator@gov.bc.ca.",
  OPERATION_REPRESENTATIVE_LABEL: "Operation representative",
  OPERATION_NAME_LABEL: "Operation name",
  OPERATOR_LEGAL_NAME_LABEL: "Operator legal name",
  OPERATOR_TRADE_NAME_LABEL: "Operator trade name",
  OPERATION_TYPE_LABEL: "Operation type",
  REGISTRATION_PURPOSE_LABEL: "Registration Purpose",
  BCGHG_ID_LABEL: "BCGHG ID",
  BORO_ID_LABEL: "BORO ID",
  REPORTING_ACTIVITIES_LABEL: "Reporting activities",
};
const BUGLE_SFO_VALUES = {
  // Bugle SFO expected values
  BUGLE_SFO_REPORT_TYPE: "Annual Report",
  BUGLE_SFO_OPERATION_NAME: "Bugle SFO - Registered - name from admin",
  BUGLE_SFO_OPERATOR_LEGAL_NAME:
    "Bravo Technologies - has parTNER operator - name from admin",
  BUGLE_SFO_OPERATOR_TRADE_NAME: "Bravo Technologies",
  BUGLE_SFO_OPERATION_TYPE: "Single Facility Operation",
  BUGLE_SFO_REGISTRATION_PURPOSE: "OBPS Regulated Operation",
  BUGLE_SFO_BCGHG_ID: "23219990028",
  BUGLE_SFO_BORO_ID: "23-0001",
  BUGLE_SFO_OPERATION_REPRESENTATIVES: ["Bill Blue", "Bob Brown"],
  BUGLE_SFO_REPORTING_ACTIVITIES: [
    "General stationary combustion excluding line tracing",
  ],
};

export class ReportOperationPOM {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async verifyBugleSfoFields(): Promise<void> {
    // 1. Report type — combobox (name matches the start of the long label)
    await expect(
      this.page.getByRole("combobox", {
        name: /Select what type of report/i,
      }),
    ).toHaveValue(BUGLE_SFO_VALUES.BUGLE_SFO_REPORT_TYPE);

    // 2. Operation representatives — multi-select, selected names visible as chips
    await assertFieldVisibility(
      this.page,
      BUGLE_SFO_VALUES.BUGLE_SFO_OPERATION_REPRESENTATIVES as unknown as string[],
      true,
    );

    // 3–5. Editable text inputs — verify pre-populated values
    const operatorLegalName = this.page.getByLabel(
      new RegExp(OPERATION_INFO_FIELDS.OPERATOR_LEGAL_NAME_LABEL, "i"),
    );
    const operatorTradeName = this.page.getByLabel(
      new RegExp(OPERATION_INFO_FIELDS.OPERATOR_TRADE_NAME_LABEL, "i"),
    );
    const operationName = this.page.getByLabel(
      new RegExp(OPERATION_INFO_FIELDS.OPERATION_NAME_LABEL, "i"),
    );

    await expect(operatorLegalName).toHaveValue(
      BUGLE_SFO_VALUES.BUGLE_SFO_OPERATOR_LEGAL_NAME,
    );
    await expect(operatorTradeName).toHaveValue(
      BUGLE_SFO_VALUES.BUGLE_SFO_OPERATOR_TRADE_NAME,
    );
    await expect(operationName).toHaveValue(
      BUGLE_SFO_VALUES.BUGLE_SFO_OPERATION_NAME,
    );

    // 6–9. Read-only fields — verify values and disabled state
    const operationType = this.page.getByLabel(
      new RegExp(OPERATION_INFO_FIELDS.OPERATION_TYPE_LABEL, "i"),
    );
    const registrationPurpose = this.page.getByLabel(
      new RegExp(OPERATION_INFO_FIELDS.REGISTRATION_PURPOSE_LABEL, "i"),
    );
    const bcghgId = this.page.getByLabel(
      new RegExp(OPERATION_INFO_FIELDS.BCGHG_ID_LABEL, "i"),
    );
    const boroId = this.page.getByLabel(
      new RegExp(OPERATION_INFO_FIELDS.BORO_ID_LABEL, "i"),
    );

    await expect(operationType).toHaveValue(
      BUGLE_SFO_VALUES.BUGLE_SFO_OPERATION_TYPE,
    );
    await expect(registrationPurpose).toHaveValue(
      BUGLE_SFO_VALUES.BUGLE_SFO_REGISTRATION_PURPOSE,
    );
    await expect(bcghgId).toHaveValue(BUGLE_SFO_VALUES.BUGLE_SFO_BCGHG_ID);
    await expect(boroId).toHaveValue(BUGLE_SFO_VALUES.BUGLE_SFO_BORO_ID);
    await checkFormFieldsReadOnly([
      operationType,
      registrationPurpose,
      bcghgId,
      boroId,
    ]);

    // 10. Reporting activities
    await assertFieldVisibility(
      this.page,
      BUGLE_SFO_VALUES.BUGLE_SFO_REPORTING_ACTIVITIES as unknown as string[],
      true,
    );
  }

  async verifyFieldVisibility(): Promise<void> {
    await assertFieldVisibility(
      this.page,
      Object.values(OPERATION_INFO_FIELDS),
      true,
    );
  }
}
