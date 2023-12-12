import { RJSFValidationError } from "@rjsf/utils";

export const customTransformErrors = (
  errors: RJSFValidationError[],
  customFormatsErrorMessages: { [key: string]: string },
) => {
  return errors.map((error) => {
    if (error.name !== "format") return error;
    if (!customFormatsErrorMessages[error.params.format]) return error;
    return {
      ...error,
      message: customFormatsErrorMessages[error.params.format],
      // rjsf appears to display error.stack, not error.message
      stack: customFormatsErrorMessages[error.params.format],
    };
  });
};
