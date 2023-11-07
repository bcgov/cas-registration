import { ThemeProps, getDefaultRegistry } from "@rjsf/core";
import * as widgets from "./widgets";
import InlineFieldTemplate from "@/app/styles/rjsf/InlineFieldTemplate";

const { fields, widgets: defaultWidgets } = getDefaultRegistry();

const formTheme: ThemeProps = {
  fields: {
    ...fields,
  },
  widgets: {
    ...defaultWidgets,
    ...widgets,
  },
  templates: {
    ...getDefaultRegistry().templates,
    FieldTemplate: InlineFieldTemplate,
  },
};

export default formTheme;
