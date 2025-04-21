import { describe, expect } from "vitest";
import customTransformErrors from "@bciers/utils/src/customTransformErrors";
import { customFormatsErrorMessages } from "@bciers/components/form/FormBase";

const minItemsError = [
  {
    name: "minItems",
    property: ".section1.activities",
    message: "must NOT have fewer than 2 items",
    params: {
      limit: 2,
    },
    stack: "'Reporting Activities' must NOT have fewer than 1 items",
    schemaPath:
      "#/properties/section1/dependencies/registration_purpose/oneOf/0/properties/activities/minItems",
  },
];

const enumError = [
  {
    name: "enum",
    property: "color",
    message: "must be equal to one of the allowed values",
    params: {
      allowedValues: ["red", "green", "blue"],
    },
    stack: "'color' must be equal to one of the allowed values",
    schemaPath: "#/properties/color/enum",
  },
];

const stringError = [
  {
    name: "type",
    property: ".name",
    message: "must be string",
    params: {
      type: "string",
    },
    stack: "'name' must be string",
    schemaPath: "#/properties/name/type",
  },
];

const numberError = [
  {
    name: "type",
    property: ".age",
    message: "must be number",
    params: {
      type: "number",
    },
    stack: "'age' must be number",
    schemaPath: "#/properties/age/type",
  },
];

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

const latitudeError = [
  {
    name: "maximum",
    property: ".section2.latitude_of_largest_emissions",
    message: "must be <= 90",
    params: {
      comparison: "<=",
      limit: 90,
    },
    stack: "'Latitude of Largest Point of Emissions' must be <= 90",
    schemaPath:
      "#/properties/section2/properties/latitude_of_largest_emissions/maximum",
  },
];
const longitudeError = [
  {
    name: "minimum",
    property: ".section2.longitude_of_largest_emissions",
    message: "must be >= -180",
    params: {
      comparison: ">=",
      limit: -180,
    },
    stack: "'Longitude of Largest Point of Emissions' must be >= -180",
    schemaPath:
      "#/properties/section2/properties/longitude_of_largest_emissions/minimum",
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

const attachmentError = [
  {
    name: "required",
    property: ".section2.boundary_map",
    message: "must have required property '.section2.boundary_map'",
    params: {
      missingProperty: "boundary_map",
    },
    stack: "must have required property 'Boundary Map'",
    schemaPath: "#/properties/section2/required",
  },
];

describe("customTransformErrors", () => {
  it("returns the transformed error message for minItems error", () => {
    const originalErrorMessage = minItemsError[0].message;
    const transformedErrors = customTransformErrors(
      minItemsError,
      customFormatsErrorMessages,
    );

    expect(transformedErrors[0].message).not.toBe(originalErrorMessage);
    expect(transformedErrors[0].message).toBe("Select at least one option");
  });

  it("returns the transformed error message for enum error", () => {
    const originalErrorMessage = enumError[0].message;
    const transformedErrors = customTransformErrors(
      enumError,
      customFormatsErrorMessages,
    );

    expect(transformedErrors[0].message).not.toBe(originalErrorMessage);
    expect(transformedErrors[0].message).toBe("Select a Color");
  });

  it("returns the transformed error message for must be string error", () => {
    const originalErrorMessage = stringError[0].message;
    const transformedErrors = customTransformErrors(
      stringError,
      customFormatsErrorMessages,
    );

    expect(transformedErrors[0].message).not.toBe(originalErrorMessage);
    expect(transformedErrors[0].message).toBe("Enter letters only");
  });
  it("returns the transformed error message for must be number error", () => {
    const originalErrorMessage = numberError[0].message;
    const transformedErrors = customTransformErrors(
      numberError,
      customFormatsErrorMessages,
    );

    expect(transformedErrors[0].message).not.toBe(originalErrorMessage);
    expect(transformedErrors[0].message).toBe("Enter numbers only");
  });

  it("returns the transformed error message for required field", () => {
    const originalErrorMessage = requiredFieldError[0].message;
    const transformedErrors = customTransformErrors(
      requiredFieldError,
      customFormatsErrorMessages,
    );

    expect(transformedErrors[0].message).not.toBe(originalErrorMessage);
    expect(transformedErrors[0].message).toBe("Legal name is required");
  });

  it("returns the transformed error message for a nested required field", () => {
    const sectionedLatitude = [
      {
        name: "required",
        property:
          ".facility_information_array.0.section1.latitude_of_largest_emissions",
        message: "must have required property 'email'",
        params: {
          missingProperty: "latitude_of_largest_emissions",
        },
        stack:
          "must have required property 'Latitude of Largest Point of Emissions'",
        schemaPath:
          "#/properties/facility_information_array/items/properties/section1/dependencies/type/oneOf/1/required",
      },
    ];
    const originalErrorMessage = sectionedLatitude[0].message;
    const transformedErrors = customTransformErrors(
      sectionedLatitude,
      customFormatsErrorMessages,
    );

    expect(transformedErrors[0].message).not.toBe(originalErrorMessage);
    expect(transformedErrors[0].message).toBe(
      "Latitude of largest point of emissions must be between -90 to 90",
    );
  });

  it("returns the same error message for minimum length", () => {
    const transformedErrors = customTransformErrors(
      mininumLengthError,
      customFormatsErrorMessages,
    );

    expect(transformedErrors[0].message).toBe(mininumLengthError[0].message);
  });

  it("returns the transformed error message for array minItems", () => {
    const originalErrorMessage = arrayMinItemsError[0].message;
    const transformedErrors = customTransformErrors(
      arrayMinItemsError,
      customFormatsErrorMessages,
    );

    expect(transformedErrors[0].message).not.toBe(originalErrorMessage);
    expect(transformedErrors[0].message).toBe("Select at least one option");
  });

  // specific field errors
  it("returns the transformed error message for  latitude", () => {
    const originalErrorMessage = latitudeError[0].message;
    const transformedErrors = customTransformErrors(
      latitudeError,
      customFormatsErrorMessages,
    );

    expect(transformedErrors[0].message).not.toBe(originalErrorMessage);
    expect(transformedErrors[0].message).toBe(
      "Latitude of largest point of emissions must be between -90 to 90",
    );
  });
  it("returns the transformed error message for  longitude", () => {
    const originalErrorMessage = longitudeError[0].message;
    const transformedErrors = customTransformErrors(
      longitudeError,
      customFormatsErrorMessages,
    );

    expect(transformedErrors[0].message).not.toBe(originalErrorMessage);
    expect(transformedErrors[0].message).toBe(
      "Longitude of largest point of emissions must be between -180 to 180",
    );
  });
  it("returns the transformed error message for attachments", () => {
    const originalErrorMessage = attachmentError[0].message;
    const transformedErrors = customTransformErrors(
      attachmentError,
      customFormatsErrorMessages,
    );

    expect(transformedErrors[0].message).not.toBe(originalErrorMessage);
    expect(transformedErrors[0].message).toBe("Attachment is required");
  });

  it("returns the transformed error message for CRA Business Number", () => {
    const originalErrorMessage = craBusinessNumberError[0].message;
    const transformedErrors = customTransformErrors(
      craBusinessNumberError,
      customFormatsErrorMessages,
    );

    expect(transformedErrors[0].message).not.toBe(originalErrorMessage);
    expect(transformedErrors[0].message).toBe(
      "CRA Business Number should be 9 digits.",
    );
  });
  // format errors (format errors appear to only work for string fields)
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
});
