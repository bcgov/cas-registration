import defaultTheme from "@bciers/components/form/theme/defaultTheme";
import * as readonlyWidgets from "@bciers/components/form/widgets/readOnly";
import ReadOnlyWidget from "@bciers/components/form/widgets/readOnly/ReadOnlyWidget";
import ReadOnlyBooleanWidget from "@bciers/components/form/widgets/readOnly/ReadOnlyBooleanWidget";
import ReadOnlyComboBoxWidget from "@bciers/components/form/widgets/readOnly/ReadOnlyComboBoxWidget";
import ReadOnlyDateWidget from "@bciers/components/form/widgets/readOnly/ReadOnlyDateWidget";
import ReadOnlyFileWidget from "@bciers/components/form/widgets/readOnly/ReadOnlyFileWidget";
import ReadOnlyMultiSelectWidget from "@bciers/components/form/widgets/readOnly/ReadOnlyMultiSelectWidget";
import { getDefaultRegistry } from "@rjsf/core";
import { InlineFieldTemplate } from "../fields";
import TitleFieldTemplate from "@bciers/components/form/fields/TitleFieldTemplate";
import ReadOnlyArrayFieldTemplate from "../fields/readonly/ReadOnlyArrayFieldTemplate";
import ReadOnlyRadioWidget from "../widgets/readOnly/ReadOnlyRadioWidget";
import {
  BcghgIdWidget,
  BoroIdWidget,
  OperationRepresentativeWidget,
} from "../widgets";
import ModalWidget from "../widgets/ModalWidget";

const { templates: defaultTemplates } = getDefaultRegistry();

const readOnlyTheme = {
  ...defaultTheme,
  widgets: {
    ...readonlyWidgets,
    CheckboxWidget: ReadOnlyBooleanWidget,
    ComboBox: ReadOnlyComboBoxWidget,
    DateWidget: ReadOnlyDateWidget,
    EmailWidget: ReadOnlyWidget,
    FileWidget: ReadOnlyFileWidget,
    MultiSelectWidget: ReadOnlyMultiSelectWidget,
    PhoneWidget: ReadOnlyWidget,
    PostalCodeWidget: ReadOnlyWidget,
    RadioWidget: ReadOnlyRadioWidget,
    SelectWidget: ReadOnlyWidget,
    TextWidget: ReadOnlyWidget,
    ToggleWidget: ReadOnlyBooleanWidget,
    URLWidget: ReadOnlyWidget,
    BoroIdWidget: BoroIdWidget,
    BcghgIdWidget: BcghgIdWidget,
    OperationRepresentativeWidget: OperationRepresentativeWidget,
    ModalWidget: ModalWidget,
  },
  templates: {
    ...defaultTemplates,
    FieldTemplate: InlineFieldTemplate,
    TitleFieldTemplate,
    ArrayFieldTemplate: ReadOnlyArrayFieldTemplate,
  },
};

export default readOnlyTheme;
