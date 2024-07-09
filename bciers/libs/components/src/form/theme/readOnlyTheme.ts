import defaultTheme from "@bciers/components/form/theme/defaultTheme";
import ReadOnlyWidget from "@bciers/components/form/widgets/readOnly/ReadOnlyWidget";
import ReadOnlyBooleanWidget from "@bciers/components/form/widgets/readOnly/ReadOnlyBooleanWidget";
import ReadOnlyComboBoxWidget from "@bciers/components/form/widgets/readOnly/ReadOnlyComboBoxWidget";
import ReadOnlyFileWidget from "@bciers/components/form/widgets/readOnly/ReadOnlyFileWidget";
import ReadOnlyMultiSelectWidget from "@bciers/components/form/widgets/readOnly/ReadOnlyMultiSelectWidget";
import { getDefaultRegistry } from "@rjsf/core";
import { InlineFieldTemplate } from "../fields";
import TitleFieldTemplate from "@bciers/components/form/fields/TitleFieldTemplate";
import ReadOnlyArrayFieldTemplate from "../fields/readonly/ReadOnlyArrayFieldTemplate";

const { templates: defaultTemplates } = getDefaultRegistry();

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
  templates: {
    ...defaultTemplates,
    FieldTemplate: InlineFieldTemplate,
    TitleFieldTemplate,
    ArrayFieldTemplate: ReadOnlyArrayFieldTemplate,
  },
};

export default readOnlyTheme;