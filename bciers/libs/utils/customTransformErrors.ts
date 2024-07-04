import { RJSFValidationError } from "@rjsf/utils";

const customTransformErrors = (
  errors: RJSFValidationError[],
  customFormatsErrorMessages: { [key: string]: string },
) => {
  return errors.map((error) => {
    if (error?.property) {
      if (
        [".cra_business_number", ".po_cra_business_number"].includes(
          error.property,
        )
      )
        error.message = customFormatsErrorMessages.cra_business_number;
      if (error.property === ".statutory_declaration")
        error.message = customFormatsErrorMessages.statutory_declaration;
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

export default customTransformErrors;
