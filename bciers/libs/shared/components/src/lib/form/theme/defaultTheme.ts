import { ThemeProps, getDefaultRegistry } from "@rjsf/core";
import * as widgets from "@bciers/components/form/widgets";
import InlineFieldTemplate from "@bciers/components/form/fields/InlineFieldTemplate";
import TitleFieldTemplate from "@bciers/components/form/fields/TitleFieldTemplate";

const {
  fields,
  templates: defaultTemplates,
  widgets: defaultWidgets,
} = getDefaultRegistry();

const formTheme: ThemeProps = {
  fields: {
    ...fields,
  },
  widgets: {
    ...defaultWidgets,
    // If creating a new widget don't forget to handle it in the readonly theme
    ...widgets,
  },
  templates: {
    ...defaultTemplates,
    FieldTemplate: InlineFieldTemplate,
    TitleFieldTemplate,
  },
};

export default formTheme;
