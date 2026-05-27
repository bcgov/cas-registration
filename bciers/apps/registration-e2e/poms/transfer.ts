/**
 * 📖 https://playwright.dev/docs/pom
 * Page objects model (POM) simplify test authoring by creating a higher-level API
 * POM simplify maintenance by capturing element selectors in one place and create reusable code to avoid repetition.
 */
import { Locator, Page, expect } from "@playwright/test";
import {
  assertConfirmationModal,
  clickButton,
  fillComboxboxWidget,
  fillInputValueByLabel,
} from "@bciers/e2e/utils/helpers";
import { TransferRoute, TransferStatus } from "../utils/enums";

export class TransferPOM {
  readonly page: Page;
  readonly transfersUrl: string;
  readonly transferEntityUrl: string;

  constructor(page: Page) {
    this.page = page;
    this.transfersUrl = process.env.E2E_BASEURL + TransferRoute.TRANSFERS;
    this.transferEntityUrl =
      process.env.E2E_BASEURL + TransferRoute.TRANSFER_ENTITY;
  }

  // ### Actions ###

  /** Navigates to the transfers list page. */
  async route() {
    await this.page.goto(this.transfersUrl);
    await this.page.waitForLoadState();
  }

  /** Navigates to the transfer entity form page. */
  async routeToTransferEntity() {
    await this.page.goto(this.transferEntityUrl);
    await this.page.waitForLoadState();
  }

  /**
   * Fills the operation transfer form with the given operator, operation, and effective date.
   *
   * Wraps the radio selection, operation, date, and button check in expect.toPass because
   * handleOperatorChange Server Actions fire on each operator change with a stale closure
   * capturing transfer_entity = "". If a stale SA completes after radio.check(), it resets
   * the radio to unchecked. Retrying the entire block re-checks it after all SAs have settled.
   */
  async fillOperationTransferForm(
    fromOperator: string,
    toOperator: string,
    operation: string,
    effectiveDate: string,
  ) {
    await fillComboxboxWidget(this.page, /current operator/i, fromOperator);
    await fillComboxboxWidget(
      this.page,
      /select the new operator/i,
      toOperator,
    );
    await expect(async () => {
      await this.page.getByRole("radio", { name: /^operation$/i }).check();
      await fillComboxboxWidget(this.page, /^operation/i, operation);
      await fillInputValueByLabel(
        this.page,
        /effective date of transfer/i,
        effectiveDate,
      );
      await expect(
        this.page.getByRole("button", { name: /transfer entity/i }),
      ).toBeEnabled({ timeout: 2000 });
    }).toPass({ timeout: 20000 });
  }

  /**
   * Fills the facility transfer form with the given operators, source operation, facility,
   * destination operation, and effective date.
   *
   * Subject to the same stale-SA race as fillOperationTransferForm — the facility radio is
   * wrapped in expect.toPass so any late-completing handleOperatorChange SA reset is retried.
   *
   * Facility selection uses a nested toPass block: facilities load via a Server Action that
   * calls resetKey(), re-mounting the form; with freeSolo=true, MUI only renders the listbox
   * when options exist, so fill() is retried until the re-mounted form has loaded options.
   *
   * After selecting a facility, Escape closes the inline MUI multi-select popup (disablePortal
   * renders it inline, where it overlaps the to_operation input below).
   *
   * The final to_operation, date, and button check are also wrapped in toPass for the same
   * late-reset race.
   */
  async fillFacilityTransferForm(
    fromOperator: string,
    toOperator: string,
    fromOperation: string,
    facility: string,
    toOperation: string,
    effectiveDate: string,
  ) {
    await fillComboxboxWidget(this.page, /current operator/i, fromOperator);
    await fillComboxboxWidget(
      this.page,
      /select the new operator/i,
      toOperator,
    );
    await expect(async () => {
      await this.page.getByRole("radio", { name: /^facility$/i }).check();
    }).toPass({ timeout: 10000 });
    await fillComboxboxWidget(
      this.page,
      /select the operation that the facility/i,
      fromOperation,
    );
    const facilitiesInput = this.page.getByRole("combobox", {
      name: /^facilities/i,
    });
    const facilityListbox = this.page.locator(".MuiAutocomplete-listbox");
    await expect(async () => {
      await facilitiesInput.fill(facility);
      await expect(facilityListbox).toBeVisible({ timeout: 2000 });
    }).toPass({ timeout: 15000 });
    await facilityListbox
      .getByRole("option", { name: facility })
      .first()
      .click();
    await this.page.keyboard.press("Escape");
    await expect(async () => {
      await fillComboxboxWidget(
        this.page,
        /select the new operation the facility/i,
        toOperation,
      );
      await fillInputValueByLabel(
        this.page,
        /effective date of transfer/i,
        effectiveDate,
      );
      await expect(
        this.page.getByRole("button", { name: /transfer entity/i }),
      ).toBeEnabled({ timeout: 2000 });
    }).toPass({ timeout: 20000 });
  }

  async submitTransfer() {
    await clickButton(this.page, /transfer entity/i);
  }

  async returnToTransferGrid() {
    await clickButton(this.page, /return to transfer requests table/i);
  }

  async clickEditDetails() {
    await clickButton(this.page, /edit details/i);
  }

  async fillEffectiveDate(date: string) {
    await fillInputValueByLabel(this.page, /effective date of transfer/i, date);
  }

  async clickCancelTransfer() {
    // await expect(
    //   this.page.getByRole("button", { name: /cancel transfer/i }),
    // ).toBeVisible();
    await clickButton(this.page, /cancel transfer/i);
  }

  async confirmCancelTransfer() {
    await clickButton(this.page, /yes, cancel this transfer/i);
    await this.page.waitForURL(new RegExp(TransferRoute.TRANSFERS));
  }

  /**
   * Navigates to the transfers list, finds the first "To be transferred" row matching
   * entityName, and opens its detail page via viewTransferDetails.
   */
  async routeToFixturePendingTransferDetail(entityName: string) {
    await this.route();
    const row = this.page
      .getByRole("row")
      .filter({ hasText: entityName })
      .filter({ hasText: TransferStatus.TO_BE_TRANSFERRED })
      .first();
    await expect(row).toBeVisible();
    await this.viewTransferDetails(row);
  }

  /**
   * Clicks the "View details" link on a transfer row and waits for the detail page to load.
   *
   * Waits for a UUID-containing URL to confirm navigation away from the transfers list,
   * then verifies "Effective date of transfer" is visible — a field always present on
   * the detail page for both operation and facility transfers (sharedSchemaProperties).
   */
  async viewTransferDetails(row: Locator) {
    const viewDetailsLink = await row.getByRole("link", { name: /view details/i });
    await expect(viewDetailsLink).toBeVisible();
    await viewDetailsLink.click();
    const uuidPattern = "[0-9a-fA-F-]+";
    await this.page.waitForURL(new RegExp(`transfers/${uuidPattern}`));
    await expect(
      this.page.getByText(/effective date of transfer/i),
    ).toBeVisible();
  }

  // ### Assertions ###
  async assertTransferRowInGrid(entityName: string, status: string) {
    const row = this.page
      .getByRole("row")
      .filter({ hasText: entityName })
      .first();
    await expect(row).toBeVisible();
    await expect(row).toContainText(status);
  }

  async assertTransferCancelled(entityName: string) {
    const row = this.page
      .getByRole("row")
      .filter({ hasText: entityName })
      .filter({ hasText: TransferStatus.TO_BE_TRANSFERRED });
    await expect(row).toHaveCount(0);
  }

  async assertFutureTransferSuccess() {
    await expect(this.page.getByText(/will be transferred/i)).toBeVisible();
  }

  async assertPastTransferSuccess() {
    await expect(
      this.page.getByRole("heading", { name: /^transferred$/i }),
    ).toBeVisible();
    await expect(this.page.getByText(/has been transferred/i)).toBeVisible();
  }

  async assertEditDetailsVisible() {
    await expect(
      this.page.getByRole("button", { name: /edit details/i }),
    ).toBeVisible();
  }

  async assertCancelConfirmationModal() {
    await assertConfirmationModal(
      this.page,
      /confirmation/i,
      /are you sure you want to cancel this transfer/i,
      /yes, cancel this transfer/i,
    );
  }

  async assertMakeTransferButtonVisible() {
    await expect(
      this.page.getByRole("link", { name: /make a transfer/i }),
    ).toBeVisible();
  }
}
