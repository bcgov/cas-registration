import { ThemeProps, getDefaultRegistry } from "@rjsf/core";
import * as widgets from "./widgets";
import ArrayFieldTemplate from "@/app/styles/rjsf/ArrayFieldTemplate";
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
    ArrayFieldTemplate: ArrayFieldTemplate,
    FieldTemplate: InlineFieldTemplate,
  },
};

export default formTheme;
