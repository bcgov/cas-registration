import defaultTheme from "@components/form/theme/defaultTheme";
import ReadOnlyWidget from "@components/form/widgets/readOnly/ReadOnlyWidget";
import ReadOnlyBooleanWidget from "@components/form/widgets/readOnly/ReadOnlyBooleanWidget";
import ReadOnlyComboBoxWidget from "@components/form/widgets/readOnly/ReadOnlyComboBoxWidget";
import ReadOnlyFileWidget from "@components/form/widgets/readOnly/ReadOnlyFileWidget";
import ReadOnlyMultiSelectWidget from "@components/form/widgets/readOnly/ReadOnlyMultiSelectWidget";

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
