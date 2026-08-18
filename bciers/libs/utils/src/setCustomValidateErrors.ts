import { validationErrors } from "@rjsf/utils";

const setNestedErrorForCustomValidate = (
  errors: validationErrors,
  path: string,
  errorMessage: string,
) => {
  const keys = path.split(".");

  let curr = errors; // Initial object pointer
  for (const key of keys) {
    if (!curr[key]) return; // If doesn't exist, return
    curr = curr[key]; // Traverse another level deeper into the nested errorSchema
  }

  // Set error message when path is found at last object
  curr.addError(errorMessage);
};

export default setNestedErrorForCustomValidate;
