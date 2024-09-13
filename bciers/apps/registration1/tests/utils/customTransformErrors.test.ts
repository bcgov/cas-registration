import { describe, expect } from "vitest";
import customTransformErrors from "@bciers/utils/customTransformErrors";
import { customFormatsErrorMessages } from "@bciers/components/form/FormBase";

const requiredFieldError = [
  {
    name: "required",
    property: "legal_name",
    message: "must have required property 'Legal Name'",
    params: {
      missingProperty: "legal_name",
    },
    stack: "must have required property 'Legal Name'",
    schemaPath: "#/required",
  },
];

const mininumLengthError = [
  {
    name: "minLength",
    property: "name",
    message: "Minimum length of 3",
    params: {
      limit: 3,
    },
    stack: "must NOT have fewer than 3 characters",
    schemaPath: "#/properties/name/minLength",
  },
];

const craBusinessNumberError = [
  {
    name: "minimum",
    property: ".cra_business_number",
    message: "must be >= 100000000",
    params: {
      comparison: ">=",
      limit: 100000000,
    },
    stack: "'CRA Business Number' must be >= 100000000",
    schemaPath: "#/properties/cra_business_number/minimum",
  },
];

const bcCorporateRegistryNumberError = [
  {
    name: "format",
    property: ".bc_corporate_registry_number",
    message: 'must match format "bc_corporate_registry_number"',
    params: {
      format: "bc_corporate_registry_number",
    },
    stack:
      "'BC Corporate Registry Number' must match format \"bc_corporate_registry_number\"",
    schemaPath: "#/properties/bc_corporate_registry_number/format",
  },
];

const urlFormatError = [
  {
    name: "format",
    property: ".website",
    message: 'must match format "uri"',
    params: {
      format: "uri",
    },
    stack: "'Website (optional)' must match format \"uri\"",
    schemaPath: "#/properties/website/format",
  },
];

const postalCodeFormatError = [
  {
    name: "format",
    property: ".physical_postal_code",
    message: 'must match format "postal-code"',
    params: {
      format: "postal-code",
    },
    stack: "'Postal Code' must match format \"postal-code\"",
    schemaPath: "#/properties/physical_postal_code/format",
  },
];

const emailFormatError = [
  {
    name: "format",
    property: ".email",
    message: 'must match format "email"',
    params: {
      format: "email",
    },
    stack: "'Email' must match format \"email\"",
    schemaPath: "#/properties/email/format",
  },
];

const phoneFormatError = [
  {
    name: "format",
    property: ".phone",
    message: 'must match format "phone"',
    params: {
      format: "phone",
    },
    stack: "'Phone' must match format \"phone\"",
    schemaPath: "#/properties/phone/format",
  },
];

const arrayMinItemsError = [
  {
    name: "minItems",
    property: ".array_field",
    message: "must NOT have fewer than 1 items",
    params: {
      limit: 1,
    },
    stack: "'Array Field' must NOT have fewer than 1 items",
    schemaPath: "#/properties/array_field/minItems",
  },
];

describe("customTransformErrors", () => {
  it("returns the transformed error message for required field", () => {
    const originalErrorMessage = requiredFieldError[0].message;
    const transformedErrors = customTransformErrors(
      requiredFieldError,
      customFormatsErrorMessages,
    );

    expect(transformedErrors[0].message).not.toBe(originalErrorMessage);
    expect(transformedErrors[0].message).toBe("Required field");
  });

  it("returns the same error message for minimum length", () => {
    const transformedErrors = customTransformErrors(
      mininumLengthError,
      customFormatsErrorMessages,
    );

    expect(transformedErrors[0].message).toBe(mininumLengthError[0].message);
  });

  it("returns the transformed error message for CRA Business Number", () => {
    const originalErrorMessage = craBusinessNumberError[0].message;
    const transformedErrors = customTransformErrors(
      craBusinessNumberError,
      customFormatsErrorMessages,
    );

    expect(transformedErrors[0].message).not.toBe(originalErrorMessage);
    expect(transformedErrors[0].message).toBe(
      customFormatsErrorMessages.cra_business_number,
    );
  });

  it("returns the transformed error message for BC Corporate Registry Number", () => {
    const originalErrorMessage = bcCorporateRegistryNumberError[0].message;
    const transformedErrors = customTransformErrors(
      bcCorporateRegistryNumberError,
      customFormatsErrorMessages,
    );

    expect(transformedErrors[0].message).not.toBe(originalErrorMessage);
    expect(transformedErrors[0].message).toBe(
      customFormatsErrorMessages.bc_corporate_registry_number,
    );
  });

  it("returns the transformed error message for URL format", () => {
    const originalErrorMessage = urlFormatError[0].message;
    const transformedErrors = customTransformErrors(
      urlFormatError,
      customFormatsErrorMessages,
    );

    expect(transformedErrors[0].message).not.toBe(originalErrorMessage);
    expect(transformedErrors[0].message).toBe(customFormatsErrorMessages.uri);
  });

  it("returns the transformed error message for Postal Code format", () => {
    const originalErrorMessage = postalCodeFormatError[0].message;
    const transformedErrors = customTransformErrors(
      postalCodeFormatError,
      customFormatsErrorMessages,
    );

    expect(transformedErrors[0].message).not.toBe(originalErrorMessage);
    expect(transformedErrors[0].message).toBe(
      customFormatsErrorMessages["postal-code"],
    );
  });

  it("returns the transformed error message for Email format", () => {
    const originalErrorMessage = emailFormatError[0].message;
    const transformedErrors = customTransformErrors(
      emailFormatError,
      customFormatsErrorMessages,
    );

    expect(transformedErrors[0].message).not.toBe(originalErrorMessage);
    expect(transformedErrors[0].message).toBe(customFormatsErrorMessages.email);
  });

  it("returns the transformed error message for Phone format", () => {
    const originalErrorMessage = phoneFormatError[0].message;
    const transformedErrors = customTransformErrors(
      phoneFormatError,
      customFormatsErrorMessages,
    );

    expect(transformedErrors[0].message).not.toBe(originalErrorMessage);
    expect(transformedErrors[0].message).toBe(customFormatsErrorMessages.phone);
  });

  it("returns the transformed error message for array minItems", () => {
    const originalErrorMessage = arrayMinItemsError[0].message;
    const transformedErrors = customTransformErrors(
      arrayMinItemsError,
      customFormatsErrorMessages,
    );

    expect(transformedErrors[0].message).not.toBe(originalErrorMessage);
    expect(transformedErrors[0].message).toBe(
      "Must not have fewer than 1 items",
    );
  });
});
