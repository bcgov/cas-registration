import defaultTheme from "@bciers/components/form/theme/defaultTheme";
import ReadOnlyWidget from "@bciers/components/form/widgets/readOnly/ReadOnlyWidget";
import ReadOnlyBooleanWidget from "@bciers/components/form/widgets/readOnly/ReadOnlyBooleanWidget";
import ReadOnlyComboBoxWidget from "@bciers/components/form/widgets/readOnly/ReadOnlyComboBoxWidget";
import ReadOnlyFileWidget from "@bciers/components/form/widgets/readOnly/ReadOnlyFileWidget";
import ReadOnlyMultiSelectWidget from "@bciers/components/form/widgets/readOnly/ReadOnlyMultiSelectWidget";

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
