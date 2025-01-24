import readOnlyTheme from "@bciers/components/form/theme/readOnlyTheme";
import FinalReviewFieldTemplate from "./FinalReviewFieldTemplate";
import FinalReviewStringField from "./FinalReviewStringField";
import FinalReviewArrayFieldTemplate from "./FinalReviewArrayFieldTemplate";
import FinalReviewMultiSelectWidget from "./FinalReviewMultiSelectWidget";

const finalReviewTheme = {
  ...readOnlyTheme,
  widgets: {
    ...readOnlyTheme.widgets,
    MultiSelectWidget: FinalReviewMultiSelectWidget,
  },
  templates: {
    ...readOnlyTheme.templates,
    FieldTemplate: FinalReviewFieldTemplate,
    ArrayFieldTemplate: FinalReviewArrayFieldTemplate,
  },
  fields: {
    ...readOnlyTheme.fields,
    StringField: FinalReviewStringField,
  },
};

export default finalReviewTheme;
