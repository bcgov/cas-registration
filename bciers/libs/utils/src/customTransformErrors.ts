import { RJSFValidationError } from "@rjsf/utils";

const getFieldName = (message: string) => {
  // we need to extract the field name from the rjsf error string
  const match = message.match(/'(.*?)'/);
  if (match && match[1]) {
    return match[1];
  }
  return;
};

export const CRA_BUSINESS_NUMBER_VALIDATION_ERROR =
  "CRA Business Number should be 9 digits.";
const LATITUDE_OF_LARGEST_EMISSIONS_VALIDATION_ERROR =
  "Latitude of largest point of emissions must be between -90 and 90";
const LONGITUDE_OF_LARGEST_EMISSIONS_VALIDATION_ERROR =
  "Longitude of largest point of emissions must be between -180 and 180";

const customTransformErrors = (
  errors: RJSFValidationError[],
  customFormatsErrorMessages: { [key: string]: string },
) => {
  return errors.map((error) => {
    // custom messages for specific properties
    if (error?.property) {
      if (error.message === "must be equal to constant") {
        error.message = undefined; // this is to handle the registration purpose dependencies. Since the schema uses oneOf, validation expects the complete oneOf formData, which we don't always have yet when a user clicks submit on an incomplete form
      }
      if (
        // we use some because fields can be nested in sections
        ["acitivities", "regulated_products"].some((field) => {
          // @ts-ignore - we already checked for error.property's existance above
          return error?.name === "required" && error.property.includes(field);
        })
      ) {
        error.message = `Select at least one option`;
        return error;
      }
      if (
        ["registration_purpose"].some((field) => {
          // @ts-ignore - we already checked for error.property's existance above
          return error.property.includes(field);
        })
      ) {
        error.message = "Registration Purpose is required";
        return error;
      }
      if (
        ["person_responsible"].some((field) => {
          // @ts-ignore - we already checked for error.property's existance above
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
          // @ts-ignore - we already checked for error.property's existance above
          return error.property.includes(field);
        })
      ) {
        error.message = CRA_BUSINESS_NUMBER_VALIDATION_ERROR;
        return error;
      }
      if (
        ["latitude_of_largest_emissions"].some((field) => {
          // @ts-ignore
          return error.property.includes(field);
        })
      ) {
        error.message = LATITUDE_OF_LARGEST_EMISSIONS_VALIDATION_ERROR;
        return error;
      }
      if (
        ["longitude_of_largest_emissions"].some((field) => {
          // @ts-ignore
          return error.property.includes(field);
        })
      ) {
        error.message = LONGITUDE_OF_LARGEST_EMISSIONS_VALIDATION_ERROR;
        return error;
      }
    }
    // custom messages for general errors
    if (error?.name === "enum") {
      // for enum errors, the field name is in the error.stack, not the error.message
      const fieldName = getFieldName(error?.stack);
      error.message = fieldName
        ? `${getFieldName(fieldName)} is required`
        : `Required field`;
      return error;
    }
    if (error?.name === "minItems") {
      error.message = `Select at least one option`;
      return error;
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
      // @ts-ignore - if there is an error, it will always have a message
      error.message = `${getFieldName(error.message)} is required`;
      return error;
    }
    return error;
  });
};

export default customTransformErrors;
