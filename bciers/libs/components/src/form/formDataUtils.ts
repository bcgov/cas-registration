import { Dict } from "@bciers/types/dictionary";
// this generic function transforms flat form data into sections based on the json schema (this component needs form data to be nested into sections to work)

export const createNestedFormData = (formData: Dict, schema: Dict) => {
  const nestedSchema: Dict = {};
  Object.keys(schema.properties).forEach((section) => {
    const sectionProperties = Object.keys(
      schema.properties[section].properties || {},
    );
    // Only copy properties that belong to this section (based on the schema).
    // Spreading ALL flat data into every section causes problems with RJSF's omitExtraData:
    // a section with extra (non-schema) properties is not considered "empty", so it is
    // excluded from the validated data entirely, producing a top-level section-required
    // error that SectionFieldTemplate cannot display. Keeping only relevant properties
    // ensures an empty section stays {}, which RJSF does include, allowing field-level
    // required errors to appear next to each individual field.
    //
    // Null values are also excluded: null from the API means "not provided" and should
    // be treated as absent so that required-field validation fires correctly (AJV's
    // `required` check passes when a key exists even if its value is null).
    nestedSchema[section] = sectionProperties.reduce((acc: Dict, prop) => {
      const value = formData[prop];
      if (value !== null && value !== undefined) {
        acc[prop] = value;
      }
      return acc;
    }, {});
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
