import { RJSFValidationError } from "@rjsf/utils";

const getFieldNameIfExists = (text: string | undefined) => {
  // we need to extract the field name from error.stack or error.message (it appears in different places depending on the error type)
  if (!text) {
    return;
  }
  // the field name is between the first and second single quotes
  const match = text.match(/'(.*?)'/);
  if (match && match[1]) {
    return match[1];
  }
};

export const CRA_BUSINESS_NUMBER_VALIDATION_ERROR =
  "CRA Business Number should be 9 digits";
const LATITUDE_OF_LARGEST_EMISSIONS_VALIDATION_ERROR =
  "Latitude of largest point of emissions must be between -90 and 90";
const LONGITUDE_OF_LARGEST_EMISSIONS_VALIDATION_ERROR =
  "Longitude of largest point of emissions must be between -180 and 180";
const BIOGENIC_PERCENTAGE_FIELDS = [
  ".biogenicIndustrialProcessEmissions.biogenicEmissionsSplit.chemicalPulpPercentage",
  ".biogenicIndustrialProcessEmissions.biogenicEmissionsSplit.limeRecoveredByKilnPercentage",
];
const customTransformErrors = (
  errors: RJSFValidationError[],
  customFormatsErrorMessages: { [key: string]: string },
) => {
  // Filter out redundant methodology validation errors
  // When gas type is selected but methodology is empty/invalid, the schema generates
  // multiple oneOf/enum errors. We filter these out to show only clean, user-friendly errors.

  const filteredErrors = errors.filter((error) => {
    // Filter out oneOf errors related to methodology/gasType dependencies
    // These appear when methodology is blank after selecting a gas type
    if (
      error.name === "oneOf" &&
      error.message === "must match exactly one schema in oneOf"
    ) {
      // Filter out oneOf errors at the emission level
      if (error.property?.match(/\.emissions\.\d+$/)) {
        return false;
      }
      // Filter out oneOf errors at the methodology level
      if (error.property?.match(/\.emissions\.\d+\.methodology$/)) {
        return false;
      }
      if (error.property?.match(/\.biogenicIndustrialProcessEmissions$/)) {
        return false;
      }
    }

    // Filter out gas type enum errors ONLY from oneOf branches
    // These appear when a gas type IS selected but methodology is blank
    // Keep the top-level enum error (when gas type is not selected at all)
    if (
      error.name === "enum" &&
      error.property?.match(/\.emissions\.\d+\.gasType$/) &&
      error.schemaPath?.includes("/oneOf/")
    ) {
      return false;
    }

    // Filter out ALL methodology enum errors
    // The custom validator will add the proper "Select a Methodology" error when gas type is selected
    if (
      error.name === "enum" &&
      error.property?.match(/\.emissions\.\d+\.methodology\.methodology$/)
    ) {
      return false;
    }

    return true;
  });

  return filteredErrors.map((error) => {
    // custom messages for specific properties
    if (error?.property) {
      if (error.message === "must be equal to constant") {
        error.message = undefined; // this is to handle the registration purpose dependencies. Since the schema uses oneOf, validation expects the complete oneOf formData, which we don't always have yet when a user clicks submit on an incomplete form
      }
      if (
        // we use some because fields can be nested in sections
        ["activities", "regulated_products"].some((field) => {
          // @ts-expect-error - we already checked for error.property's existence above
          return error?.name === "required" && error.property.includes(field);
        })
      ) {
        error.message = `Select at least one option`;
        return error;
      }
      if (
        ["registration_purpose"].some((field) => {
          // @ts-expect-error - we already checked for error.property's existence above
          return error.property.includes(field);
        })
      ) {
        error.message = "Select a Registration Purpose";
        return error;
      }
      if (
        ["person_responsible"].some((field) => {
          // @ts-expect-error - we already checked for error.property's existence above
          return error.property.includes(field);
        })
      ) {
        error.message = "Select a Person Responsible";
        return error;
      }
      if (
        [
          "cra_business_number",
          "po_cra_business_number",
          "partner_cra_business_number",
        ].some((field) => {
          // @ts-expect-error - we already checked for error.property's existence above
          return error.property.includes(field);
        })
      ) {
        error.message = CRA_BUSINESS_NUMBER_VALIDATION_ERROR;
        return error;
      }
      if (
        ["latitude_of_largest_emissions"].some((field) => {
          // @ts-expect-error - we already checked for error.property's existence above
          return error.property.includes(field);
        })
      ) {
        error.message = LATITUDE_OF_LARGEST_EMISSIONS_VALIDATION_ERROR;
        return error;
      }
      if (
        ["longitude_of_largest_emissions"].some((field) => {
          // @ts-expect-error - we already checked for error.property's existence above
          return error.property.includes(field);
        })
      ) {
        error.message = LONGITUDE_OF_LARGEST_EMISSIONS_VALIDATION_ERROR;
        return error;
      }
    }
    // custom messages for general errors
    if (error?.name === "enum") {
      // Gas type and methodology enum errors for emissions are filtered out above
      // So this only applies to other enum fields
      if (error?.property?.includes("gasType")) {
        error.message = "Select a gas type";
      } else {
        // for enum errors, the field name is in the error.stack, not the error.message
        const fieldName = getFieldNameIfExists(error?.stack);
        error.message = fieldName
          ? `Select a ${fieldName}`
          : `Select an option`;
      }

      return error;
    }
    if (error?.name === "minItems") {
      error.message = `Select at least one option`;
      return error;
    }
    // Only show the 0-100 message for biogenicIndustrialProcessEmissions fields
    if (
      (error?.name === "minimum" || error?.name === "maximum") &&
      error.property != null &&
      BIOGENIC_PERCENTAGE_FIELDS.includes(error.property)
    ) {
      error.message = "Please enter a value between 0-100";
      return error;
    }

    if (
      error.message === "must be >= 0" &&
      error.property ===
        ".biogenicIndustrialProcessEmissions.biogenicEmissionsSplit.totalAllocated"
    ) {
      error.message = "The total allocation must add up to 100%";
    }
    if (error?.message === "must be number") {
      error.message = `Enter numbers only`;
      return error;
    }
    if (error?.message === "must be string") {
      error.message = `Enter letters only`;
      return error;
    }
    // custom messages for format validation
    if (
      // note that format validation appears to only work for string type fields, not number ones
      error.name === "format" &&
      customFormatsErrorMessages[error.params.format]
    ) {
      error.message = customFormatsErrorMessages[error.params.format];
      return error;
    }
    if (error?.name === "required") {
      const fieldName = getFieldNameIfExists(error?.message);
      const selectOptionFields = ["Fuel Name", "Gas Type", "Methodology"];

      const isSelectOptionField = selectOptionFields.some((match) =>
        fieldName?.includes(match),
      );

      if (isSelectOptionField && fieldName) {
        error.message = `Select a ${fieldName}`;
      } else {
        error.message = fieldName
          ? `${fieldName} is required`
          : "Required field";
      }

      return error;
    }
    return error;
  });
};

export default customTransformErrors;
