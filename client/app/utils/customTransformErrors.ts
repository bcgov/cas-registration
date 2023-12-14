import { RJSFValidationError } from "@rjsf/utils";

export const customTransformErrors = (
  errors: RJSFValidationError[],
  customFormatsErrorMessages: { [key: string]: string },
) => {
  return errors.map((error) => {
    if (error?.name === "required") {
      error.message = "Required field";
      // remove stack after PR 316 is in
      error.stack = "Required field";
      return error;
    }
    if (
      error.name === "format" &&
      customFormatsErrorMessages[error.params.format]
    ) {
      error.message = customFormatsErrorMessages[error.params.format];
      // remove stack after PR 316 is in
      error.stack = customFormatsErrorMessages[error.params.format];
      return error;
    }
    return error;
  });
};
