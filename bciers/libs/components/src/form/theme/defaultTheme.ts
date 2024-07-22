import { ThemeProps, getDefaultRegistry } from "@rjsf/core";
import * as widgets from "@bciers/components/form/widgets";
import * as readonlyWidgets from "@bciers/components/form/widgets/readOnly";
import InlineFieldTemplate from "@bciers/components/form/fields/InlineFieldTemplate";
import TitleFieldTemplate from "@bciers/components/form/fields/TitleFieldTemplate";
import { ArrayFieldTemplate } from "../fields";

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
    ...readonlyWidgets,
  },
  templates: {
    ...defaultTemplates,
    FieldTemplate: InlineFieldTemplate,
    TitleFieldTemplate,
    ArrayFieldTemplate,
  },
};

export default formTheme;
