import { RJSFValidationError } from "@rjsf/utils";

const customTransformErrors = (
  errors: RJSFValidationError[],
  customFormatsErrorMessages: { [key: string]: string },
) => {
  return errors.map((error) => {
    if (error?.property) {
      if (error.message === "must be equal to constant") {
        error.message = undefined; // this is to handle errors generated by dependencies
      }
      if (error.message === 'must match format "data-url"') {
        error.message = undefined; // this is to handle errors generated by dependencies
      }
      if (
        [".cra_business_number", ".po_cra_business_number"].includes(
          error.property,
        )
      ) {
        error.message = customFormatsErrorMessages.cra_business_number;
        return error;
      }
      if (
        ["statutory_declaration", "new_entrant_application"].includes(
          error.property,
        )
      ) {
        error.message = customFormatsErrorMessages.mandatory_attachment;
        return error;
      }
    }
    if (error?.name === "required") {
      error.message = "Required field";
      return error;
    }
    if (error?.name === "minItems") {
      const limit = error.params.limit;
      error.message = `Must not have fewer than ${limit} items`;
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
