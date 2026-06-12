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
  async route() {
    await this.page.goto(this.transfersUrl);
    await this.page.waitForLoadState();
  }

  async routeToTransferEntity() {
    await this.page.goto(this.transferEntityUrl);
    await this.page.waitForLoadState();
  }

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
      await this.page.getByRole("radio", { name: /operation/i }).check();
      await fillComboxboxWidget(this.page, /operation/i, operation);
      await fillInputValueByLabel(
        this.page,
        /effective date of transfer/i,
        effectiveDate,
      );
      await expect(
        this.page.getByRole("button", { name: /transfer entity/i }),
      ).toBeEnabled({ timeout: 2000 });
    }).toPass({ timeout: 40000 });
  }

  async fillFacilityTransferForm(
    fromOperator: string,
    toOperator: string,
    fromOperation: string,
    facility: string,
    toOperation: string,
    effectiveDate: string,
  ) {
    await this.page.getByRole("radio", { name: /^facility$/i }).check();

    await fillComboxboxWidget(this.page, /current operator/i, fromOperator);
    await fillComboxboxWidget(
      this.page,
      /select the new operator/i,
      toOperator,
    );

    const facilitiesInput = this.page.getByRole("combobox", {
      name: /^facilities/i,
    });
    const facilityListbox = this.page.locator(".MuiAutocomplete-listbox");
    await fillComboxboxWidget(
      this.page,
      /select the new operation the facility/i,
      toOperation,
    );
    await expect(async () => {
      await fillComboxboxWidget(
        this.page,
        /select the operation that the facility/i,
        fromOperation,
      );
      await expect(facilitiesInput).toBeVisible();
      await facilitiesInput.fill(facility);
      await expect(facilityListbox).toBeVisible();
      await facilityListbox
        .getByRole("option", { name: facility })
        .first()
        .click();
    }).toPass({ timeout: 75000 });
    await fillInputValueByLabel(
      this.page,
      /effective date of transfer/i,
      effectiveDate,
    );
    await expect(
      this.page.getByRole("button", { name: /transfer entity/i }),
    ).toBeEnabled({ timeout: 5000 });
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

  async editEffectiveDate(date: string) {
    await this.clickEditDetails();
    await fillInputValueByLabel(this.page, /effective date of transfer/i, date);
    await this.submitTransfer();
    await this.assertEditDetailsVisible();
  }

  async clickCancelTransfer() {
    await expect(
      this.page.getByRole("button", { name: /cancel transfer/i }),
    ).toBeVisible();
    await clickButton(this.page, /cancel transfer/i);
  }

  async confirmCancelTransfer() {
    await clickButton(this.page, /yes, cancel this transfer/i);
    await this.page.waitForURL(new RegExp(TransferRoute.TRANSFERS));
  }

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

  async viewTransferDetails(row: Locator) {
    const viewDetailsLink = row.getByRole("link", { name: /view details/i });
    await expect(viewDetailsLink).toBeVisible();
    const href = await viewDetailsLink.getAttribute("href");
    expect(href).toMatch(/[0-9a-fA-F]{8}/);
    await this.page.goto(href);
    await expect(
      this.page.getByText(/effective date of transfer/i),
    ).toBeVisible();
  }

  // ### Assertions ###
  async assertTransferRowInGrid(entityName: string, status: string) {
    await this.returnToTransferGrid();
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

  async submitAndAssertTransfer(timing: "past" | "future") {
    await this.submitTransfer();
    if (timing === "past") {
      await this.assertPastTransferSuccess();
    } else {
      await this.assertFutureTransferSuccess();
    }
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
