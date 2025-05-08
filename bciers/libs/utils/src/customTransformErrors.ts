import { RJSFValidationError } from "@rjsf/utils";

const formatProperty = (property: string | undefined) => {
  if (!property) return ""; // Handle undefined case
  if (property.includes("bc_corporate_registry_number")) {
    return "BC Corporate Registry number";
  }
  const formatted = property.split(".").pop()?.replace(/_/g, " ") || property;
  return formatted.charAt(0).toUpperCase() + formatted.slice(1).toLowerCase();
};
export const CRA_BUSINESS_NUMBER_VALIDATION_ERROR =
  "CRA Business Number should be 9 digits.";
const MANDATORY_ATTACHMENT_VALIDATION_ERROR = "Attachment is required";
const LATITUDE_OF_LARGEST_EMISSIONS_VALIDATION_ERROR =
  "Latitude of largest point of emissions must be between -90 and 90";
const LONGITUDE_OF_LARGEST_EMISSIONS_VALIDATION_ERROR =
  "Longitude of largest point of emissions must be between -180 and 180";

const customTransformErrors = (
  errors: RJSFValidationError[],
  customFormatsErrorMessages: { [key: string]: string },
) => {
  return errors.map((error) => {
    if (error?.name === "minItems") {
      error.message = "Select at least one option";
    } else if (error?.name === "enum") {
      error.message = `Select a ${formatProperty(error.property ?? "")}`;
    } else if (
      error?.message === "must be number" ||
      error?.message === "must be number,null"
    ) {
      error.message = "Enter numbers only";
    } else if (error?.message === "must be >= 0") {
      error.message = "Enter a number >= 0";
    } else if (error?.message === "must be string") {
      error.message = "Enter letters only";
    } else if (error?.property) {
      if (error.message === "must be equal to constant") {
        error.message = undefined;
      } else if (
        ["acitivities", "regulated_products"].some(
          (field) => error.property?.includes(field),
        )
      ) {
        error.message = "Select at least one option";
      } else if (
        [
          "cra_business_number",
          "po_cra_business_number",
          "partner_cra_business_number",
        ].some((field) => error.property?.includes(field))
      ) {
        error.message = CRA_BUSINESS_NUMBER_VALIDATION_ERROR;
      } else if (
        [
          "new_entrant_application",
          "boundary_map",
          "process_flow_diagram",
        ].some((field) => error.property?.includes(field))
      ) {
        error.message = MANDATORY_ATTACHMENT_VALIDATION_ERROR;
      } else if (error.property?.includes("latitude_of_largest_emissions")) {
        error.message = LATITUDE_OF_LARGEST_EMISSIONS_VALIDATION_ERROR;
      } else if (error.property?.includes("longitude_of_largest_emissions")) {
        error.message = LONGITUDE_OF_LARGEST_EMISSIONS_VALIDATION_ERROR;
      }
    } else if (
      error.name === "format" &&
      customFormatsErrorMessages[error.params.format]
    ) {
      error.message = customFormatsErrorMessages[error.params.format];
    } else if (error?.name === "required") {
      error.message = `${formatProperty(error.property ?? "")} is required`;
    }
    return error;
  });
};

export default customTransformErrors;
