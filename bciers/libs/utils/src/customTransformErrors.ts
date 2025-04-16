import { RJSFValidationError } from "@rjsf/utils";

const customTransformErrors = (
  errors: RJSFValidationError[],
  customFormatsErrorMessages: { [key: string]: string },
) => {
  console.log("errors", errors);
  return errors.map((error) => {
    // custom messages for general errors
    if (error?.name === "required") {
      error.message = "Required field";
      return error;
    }
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
        error.message = undefined; // this is to handle the registration purpose dependencies. Since the schema uses oneOf, validation expects brianna maybe this works with req field first?
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
        error.message = customFormatsErrorMessages.cra_business_number;
        return error;
      }
      if (
        ["statutory_declaration", "new_entrant_application"].some((field) => {
          // @ts-ignore
          return error.property.includes(field);
        })
      ) {
        error.message = customFormatsErrorMessages.mandatory_attachment;
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
    return error;
  });
};

export default customTransformErrors;
