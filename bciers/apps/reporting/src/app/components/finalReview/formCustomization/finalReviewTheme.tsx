import readOnlyTheme from "@bciers/components/form/theme/readOnlyTheme";
import FinalReviewFieldTemplate from "./FinalReviewFieldTemplate";
import FinalReviewStringField from "./FinalReviewStringField";
import FinalReviewArrayFieldTemplate from "./FinalReviewArrayFieldTemplate";

const finalReviewTheme = {
  ...readOnlyTheme,
  templates: {
    ...readOnlyTheme.templates,
    FieldTemplate: FinalReviewFieldTemplate,
    ArrayFieldTemplate: FinalReviewArrayFieldTemplate,
  },
  fields: {
    StringField: FinalReviewStringField,
  },
};

export default finalReviewTheme;
