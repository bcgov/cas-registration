import FieldTemplate from "@bciers/components/form/fields/FieldTemplate";
import SourceTypeBoxTemplate from "@bciers/components/form/fields/SourceTypeBoxTemplate";
import { emissionsOnlyUiSchema } from "./common";
const uiSchema = {
  "ui:FieldTemplate": FieldTemplate,
  "ui:classNames": "form-heading-label",
  id: {
    "ui:widget": "hidden",
  },
  sourceTypes: {
    "ui:FieldTemplate": SourceTypeBoxTemplate,
    "ui:options": {
      label: false,
    },
    installationMaintOperationOfElectricalEquipment: emissionsOnlyUiSchema,
  },
};

export default uiSchema;
