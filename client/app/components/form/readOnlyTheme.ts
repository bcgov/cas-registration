import defaultTheme from "./defaultTheme";
import ReadOnlyWidget from "./widgets/readOnlyWidgets/ReadOnlyWidget";
import ReadOnlyBooleanWidget from "./widgets/readOnlyWidgets/ReadOnlyBooleanWidget";
import ReadOnlyFileWidget from "./widgets/readOnlyWidgets/ReadOnlyFileWidget";

const readOnlyTheme = {
  ...defaultTheme,
  widgets: {
    CheckboxWidget: ReadOnlyBooleanWidget,
    ComboBox: ReadOnlyWidget,
    EmailWidget: ReadOnlyWidget,
    FileWidget: ReadOnlyFileWidget,
    MultiSelectWidget: ReadOnlyWidget,
    PhoneWidget: ReadOnlyWidget,
    PostalCodeWidget: ReadOnlyWidget,
    RadioWidget: ReadOnlyBooleanWidget,
    SelectWidget: ReadOnlyWidget,
    TextWidget: ReadOnlyWidget,
    URLWidget: ReadOnlyWidget,
  },
};

export default readOnlyTheme;
