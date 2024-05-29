import { ThemeProps, getDefaultRegistry } from "@rjsf/core";
import * as widgets from "@bciers/components/form/widgets";
import InlineFieldTemplate from "@/app/styles/rjsf/InlineFieldTemplate";
import TitleFieldTemplate from "@/app/styles/rjsf/TitleFieldTemplate";

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
