import { expect } from "@playwright/test";
import { PDFParse } from "pdf-parse";
import {
  INVOICE_VOID_WATERMARK_REGEX,
  FEES_AND_ADJUSTMENTS_TEXT,
  INVOICE_NUMBER_LABEL_REGEX,
  DEFAULT_ADJUSTMENT_REGEX,
  INITIAL_OUTSTANDING_BALANCE_REGEX,
  POST_ADJUSTMENT_OUTSTANDING_BALANCE_REGEX,
} from "@/compliance-e2e/utils/constants";

export {
  INITIAL_OUTSTANDING_BALANCE_REGEX,
  POST_ADJUSTMENT_OUTSTANDING_BALANCE_REGEX,
};

export class ObligationInvoicePOM {
  private constructor(
    private readonly parsed: any,
    private readonly text: string,
  ) {}

  static async fromBuffer(buffer: Buffer): Promise<ObligationInvoicePOM> {
    const parser = new PDFParse({ data: buffer });
    const parsed = await parser.getText();

    const normalizedText = String(parsed?.text ?? "")
      .replace(/\s+/g, " ")
      .trim();

    return new ObligationInvoicePOM(parsed, normalizedText);
  }

  // -----------------------
  // Assertions (Chainable)
  // -----------------------

  assertNotVoid(): this {
    expect(this.text).not.toMatch(INVOICE_VOID_WATERMARK_REGEX);
    return this;
  }

  assertHasFeesAndAdjustments(): this {
    expect(this.text).toContain(FEES_AND_ADJUSTMENTS_TEXT);
    return this;
  }

  assertHasAdjustmentLine(matcher: RegExp = DEFAULT_ADJUSTMENT_REGEX): this {
    expect(this.text).toMatch(matcher);
    return this;
  }

  assertHasInvoiceNumber(): this {
    expect(this.text).toMatch(INVOICE_NUMBER_LABEL_REGEX);
    return this;
  }

  assertOutstandingBalance(matcher: RegExp): this {
    expect(this.text).toMatch(matcher);
    return this;
  }

  // -----------------------
  // Getters
  // -----------------------

  getText(): string {
    return this.text;
  }
}
