import FieldTemplate from "@bciers/components/form/fields/FieldTemplate";
import { TitleOnlyFieldTemplate } from "@bciers/components/form/fields";
import { CustomHelpText } from "@reporting/src/app/components/activities/uiSchemas/custom";

const uiSchema = {
  "ui:FieldTemplate": FieldTemplate,
  "ui:classNames": "form-heading-label",
  description: {
    "ui:FieldTemplate": TitleOnlyFieldTemplate,
    "ui:title": CustomHelpText,
  },
};
export default uiSchema;
