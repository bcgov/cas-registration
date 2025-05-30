import FieldTemplate from "@bciers/components/form/fields/FieldTemplate";
import { emissionsOnlyUiSchema } from "./common";
const uiSchema = {
  "ui:FieldTemplate": FieldTemplate,
  "ui:classNames": "form-heading-label",
  id: {
    "ui:widget": "hidden",
  },
  sourceTypes: {
    "ui:FieldTemplate": FieldTemplate,
    "ui:options": {
      label: false,
    },
    installationMaintOperationOfElectricalEquipment: emissionsOnlyUiSchema,
  },
};

export default uiSchema;
