import { Dict } from "@bciers/types/dictionary";
// this generic function transforms flat form data into sections based on the json schema (this component needs form data to be nested into sections to work)

export const createNestedFormData = (formData: Dict, schema: Dict) => {
  const nestedSchema: Dict = {};
  Object.keys(schema.properties).forEach((section) => {
    // Create a new object for each section instead of assigning the same reference
    // This prevents all sections from sharing the same object and getting polluted with each other's data
    nestedSchema[section] = { ...formData };
  });
  return nestedSchema;
};

// this generic function flattens sectioned form data (our backend needs flat objects)
export const createUnnestedFormData = (
  formData: Dict,
  formSectionList: string[],
) => {
  return formSectionList.reduce((acc, section) => {
    acc = { ...acc, ...formData[section] };
    return acc;
  }, {});
};
