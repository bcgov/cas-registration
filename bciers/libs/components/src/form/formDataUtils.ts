// this generic function transforms flat form data into sections based on the json schema (this component needs form data to be nested into sections to work)
export const createNestedFormData = (
  formData: { [key: string]: any },
  schema: { [key: string]: any },
) => {
  const nestedSchema: { [key: string]: any } = {};
  Object.keys(schema.properties).forEach((section) => {
    nestedSchema[section] = formData;
  });
  return nestedSchema;
};

// this generic function flattens sectioned form data (our backend needs flat objects)
export const createUnnestedFormData = (
  formData: { [key: string]: any },
  formSectionList: string[],
) => {
  return formSectionList.reduce((acc, section) => {
    acc = { ...acc, ...formData[section] };
    return acc;
  }, {});
};
