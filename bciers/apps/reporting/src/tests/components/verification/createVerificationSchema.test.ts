import { describe, expect, it } from "vitest";
import { OperationTypes } from "@bciers/utils/src/enums";
import { createVerificationSchema } from "@reporting/src/app/components/verification/createVerificationSchema";
import {
  lfoSchema,
  sfoSchema,
} from "@reporting/src/data/jsonSchema/verification/verification";

describe("createVerificationSchema", () => {
  it("does not mutate the base schema when adding info_note", () => {
    const originalProperties = { ...sfoSchema.properties };
    const originalRequired = [...(sfoSchema.required ?? [])];

    const supplementarySchema = createVerificationSchema(
      OperationTypes.SFO,
      true,
      false,
    );

    expect(supplementarySchema.properties).toHaveProperty("info_note");
    expect(sfoSchema.properties).toEqual(originalProperties);
    expect(sfoSchema.required).toEqual(originalRequired);

    // create a verification schema for an SFO that is NOT a supplementary report
    const regularSfoSchema = createVerificationSchema(
      OperationTypes.SFO,
      false,
      false,
    );

    expect(regularSfoSchema.properties).not.toHaveProperty("info_note");
  });

  it("removes required fields for EIO without mutating the base schema", () => {
    const lfoRequired = [...(lfoSchema.required ?? [])];
    const sfoRequired = [...(sfoSchema.required ?? [])];

    const eioSchema = createVerificationSchema(OperationTypes.EIO, false, true);

    expect(eioSchema.required).toEqual([]);
    expect(lfoSchema.required).toEqual(lfoRequired);
    expect(sfoSchema.required).toEqual(sfoRequired);
  });
});
