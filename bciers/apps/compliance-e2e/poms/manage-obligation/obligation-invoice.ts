import { expect } from "@playwright/test";
import { PDFParse } from "pdf-parse";
import {
  DEFAULT_COMPLIANCE_OBLIGATION_LINE,
  FEES_AND_ADJUSTMENTS_TEXT,
  INVOICE_NUMBER_LABEL,
  INVOICE_VOID_WATERMARK,
} from "@/compliance-e2e/utils/constants";

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

  assertVoid(expectedVoid: boolean = false): this {
    if (expectedVoid) {
      expect(this.text).toMatch(INVOICE_VOID_WATERMARK);
    } else {
      expect(this.text).not.toMatch(INVOICE_VOID_WATERMARK);
    }
    return this;
  }

  assertHasInvoiceNumber(): this {
    expect(this.text).toMatch(INVOICE_NUMBER_LABEL);
    return this;
  }

  assertHasFeesAndAdjustments(): this {
    expect(this.text).toContain(FEES_AND_ADJUSTMENTS_TEXT);
    return this;
  }

  assertComplianceObligationLine(): this {
    expect(this.text).toMatch(DEFAULT_COMPLIANCE_OBLIGATION_LINE);
    return this;
  }

  assertHasAdjustmentLine(matcher: RegExp): this {
    expect(this.text).toMatch(matcher);
    return this;
  }

  assertAmountDue(matcher: RegExp): this {
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
