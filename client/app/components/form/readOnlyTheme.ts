import defaultTheme from "./defaultTheme";
import ReadOnlyWidget from "./widgets/readOnly/ReadOnlyWidget";
import ReadOnlyBooleanWidget from "./widgets/readOnly/ReadOnlyBooleanWidget";
import ReadOnlyComboBoxWidget from "./widgets/readOnly/ReadOnlyComboBoxWidget";
import ReadOnlyFileWidget from "./widgets/readOnly/ReadOnlyFileWidget";
import ReadOnlyMultiSelectWidget from "./widgets/readOnly/ReadOnlyMultiSelectWidget";

const readOnlyTheme = {
  ...defaultTheme,
  widgets: {
    CheckboxWidget: ReadOnlyBooleanWidget,
    ComboBox: ReadOnlyComboBoxWidget,
    EmailWidget: ReadOnlyWidget,
    FileWidget: ReadOnlyFileWidget,
    MultiSelectWidget: ReadOnlyMultiSelectWidget,
    PhoneWidget: ReadOnlyWidget,
    PostalCodeWidget: ReadOnlyWidget,
    RadioWidget: ReadOnlyBooleanWidget,
    SelectWidget: ReadOnlyWidget,
    TextWidget: ReadOnlyWidget,
    URLWidget: ReadOnlyWidget,
  },
};

export default readOnlyTheme;
