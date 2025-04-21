import { RJSFValidationError } from "@rjsf/utils";

const formatProperty = (property: string) => {
  const removedPrefixes = property.split(".").pop() || property;
  const removedUnderstores = removedPrefixes.replace(/_/g, " ");
  return (
    removedUnderstores.charAt(0).toUpperCase() +
    removedUnderstores.slice(1).toLowerCase()
  );
};

export const CRA_BUSINESS_NUMBER_VALIDATION_ERROR =
  "CRA Business Number should be 9 digits.";
const MANDATORY_ATTACHMENT_VALIDATION_ERROR = "Attachment is mandatory.";
const LATITUDE_OF_LARGEST_EMISSIONS_VALIDATION_ERROR =
  "Latitude of largest point of emissions must be between -90 to 90";
const LONGITUDE_OF_LARGEST_EMISSIONS_VALIDATION_ERROR =
  "Longitude of largest point of emissions must be between -180 to 180";

const customTransformErrors = (
  errors: RJSFValidationError[],
  customFormatsErrorMessages: { [key: string]: string },
) => {
  return errors.map((error) => {
    // custom messages for general errors
    if (error?.name === "minItems") {
      error.message = `Select at least one option`;
      return error;
    }
    if (error?.name === "enum") {
      error.message = `Select a ${error.property}`;
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

    // custom messages for specific properties
    if (error?.property) {
      if (error.message === "must be equal to constant") {
        error.message = undefined; // this is to handle the registration purpose dependencies. Since the schema uses oneOf, validation expects the complete oneOf formData, which we don't always have yet when a user clicks submit on an incomplete form
      }
      if (
        // we use some because fields can be nested in sections
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
        [
          "new_entrant_application",
          "boundary_map",
          "process_flow_diagram",
        ].some((field) => {
          // @ts-ignore
          return error.property.includes(field);
        })
      ) {
        error.message = MANDATORY_ATTACHMENT_VALIDATION_ERROR;
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
      // @ts-ignore
      // we need to transform the property name (e.g. legal_name) into a string (e.g. Legal name)
      const fieldName = formatProperty(error.property);

      error.message = `${fieldName} is required`;
      return error;
    }
    return error;
  });
};

export default customTransformErrors;
