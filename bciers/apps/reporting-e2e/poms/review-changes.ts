import { Locator, Page, expect } from "@playwright/test";
import {
  assertFieldVisibility,
  fillInputValueByLabel,
} from "@bciers/e2e/utils/helpers";
import {
  FORM_BUTTON_TEXT,
  REVIEW_CHANGES_DEFAULT_REASON,
  REVIEW_CHANGES_REASON_LABEL,
  REVIEW_CHANGES_TEXT,
} from "@/reporting-e2e/utils/constants";

const escapeForRegExp = (value: string) =>
  value.replaceAll(/[.*+?^${}()|[\]\\]/g, String.raw`\$&`);

/**
 * Matches a label exactly, tolerating the StatusLabel chip that added and removed
 * rows render inside the same element.
 */
const exactText = (label: string) =>
  new RegExp(
    String.raw`^${escapeForRegExp(label)}\s*(ADDED|DELETED|MODIFIED)?$`,
  );

export class ReviewChangesPOM {
  readonly page: Page;

  readonly saveAndContinueButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.saveAndContinueButton = this.page.getByRole("button", {
      name: new RegExp(FORM_BUTTON_TEXT.SAVE_AND_CONTINUE, "i"),
    });
  }

  async fillReason(
    reason: string = REVIEW_CHANGES_DEFAULT_REASON,
  ): Promise<void> {
    await fillInputValueByLabel(
      this.page,
      new RegExp(REVIEW_CHANGES_REASON_LABEL, "i"),
      reason,
      { blur: "none" },
    );
  }

  async verifySaveAndContinueDisabled(): Promise<void> {
    await expect(this.saveAndContinueButton).toBeVisible();
    await expect(this.saveAndContinueButton).toBeDisabled();
  }

  async verifySaveAndContinueEnabled(): Promise<void> {
    await expect(this.saveAndContinueButton).toBeVisible();
    await expect(this.saveAndContinueButton).toBeEnabled();
  }

  /**
   * A section's body — the innermost element holding both its heading and its rows.
   *
   * Only valid for the sections rendered as `<Box><Typography className="form-heading">`,
   * where the heading is a `<p>` so the innermost enclosing `div` is the section body.
   * `SectionReview` instead renders its heading as a `div` inside a wrapper that holds
   * nothing else, so scoping to it would find no rows — see {@link changeRow}.
   */
  private section(title: string): Locator {
    return this.page
      .locator("div")
      .filter({
        has: this.page.locator(".form-heading").filter({ hasText: title }),
      })
      .last();
  }

  private changeRow(label: string, sectionTitle?: string): Locator {
    const root = sectionTitle ? this.section(sectionTitle) : this.page;

    return root
      .locator(".MuiGrid-container")
      .filter({ has: this.page.getByText(exactText(label)) })
      .last();
  }

  async verifyPageElements(
    expectComplianceNote: boolean = true,
  ): Promise<void> {
    const expected = [REVIEW_CHANGES_TEXT.HEADING, REVIEW_CHANGES_REASON_LABEL];

    if (expectComplianceNote) {
      expected.push(REVIEW_CHANGES_TEXT.COMPLIANCE_NOTE);
    }

    await assertFieldVisibility(this.page, expected, true);

    await expect(
      this.page.getByText(REVIEW_CHANGES_TEXT.NO_CHANGES_DETECTED),
    ).toHaveCount(0);
  }

  /**
   * Asserts a diff section heading is present, e.g. "Production Data".
   */
  async verifySection(title: string): Promise<void> {
    await expect(
      this.page.locator(".form-heading").filter({ hasText: title }).first(),
    ).toBeVisible();
  }

  /**
   * Asserts a single field changed from one value to another.
   */
  async verifyFieldChange({
    section,
    label,
    from,
    to,
  }: {
    section?: string;
    label: string;
    from: string;
    to: string;
  }): Promise<void> {
    const row = this.changeRow(label, section);

    await expect(row).toBeVisible();
    await expect(row).toContainText(from);
    await expect(row).toContainText(to);
  }

  /** Asserts every expected field change is reported with its old and new values. */
  async verifyFieldChanges(
    section: string,
    changes: { label: string; from: string; to: string }[],
  ): Promise<void> {
    for (const change of changes) {
      await this.verifyFieldChange({ section, ...change });
    }
  }

  /**
   * Asserts a field the supplementary added is reported with its new value.
   *
   * An added field has no previous value, so `ChangeValueBox` renders the new one
   * alone rather than a struck-through/bold pair.
   */
  async verifyFieldAdded({
    section,
    label,
    value,
  }: {
    section?: string;
    label: string;
    value: string;
  }): Promise<void> {
    const row = this.changeRow(label, section);

    await expect(row).toBeVisible();
    await expect(row).toContainText(value);
  }

  /**
   * Asserts an activity was reported as changed. `PartialActivityDiffView` renders the
   * activity name as its own heading above the changed source types.
   */
  async verifyActivityChanged(activityName: string): Promise<void> {
    await expect(this.page.getByText(activityName).first()).toBeVisible();
  }
}
