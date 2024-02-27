import { RJSFValidationError } from "@rjsf/utils";

export const customTransformErrors = (
  errors: RJSFValidationError[],
  customFormatsErrorMessages: { [key: string]: string },
) => {
  return errors.map((error) => {
    if (
      error?.property === ".cra_business_number" ||
      ".po_cra_business_number"
    ) {
      error.message = customFormatsErrorMessages.cra_business_number;
    }
    if (error?.name === "required") {
      error.message = "Required field";
      return error;
    }
    if (
      error.name === "format" &&
      customFormatsErrorMessages[error.params.format]
    ) {
      error.message = customFormatsErrorMessages[error.params.format];
      return error;
    }
    return error;
  });
};
