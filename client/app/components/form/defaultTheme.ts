import { ThemeProps, getDefaultRegistry } from "@rjsf/core";
import * as widgets from "./widgets";

const { fields, widgets: defaultWidgets } = getDefaultRegistry();

const formTheme: ThemeProps = {
  fields: {
    ...fields,
  },
  widgets: {
    ...defaultWidgets,
    ...widgets,
  },
};

export default formTheme;
