import FieldTemplate from "@bciers/components/form/fields/FieldTemplate";
import { RJSFSchema, UiSchema } from "@rjsf/utils";
import {
  facilitiesSchemaSfo,
  facilitiesSfoUiSchema,
} from "apps/administration/app/data/jsonSchema/facilitiesSfo";
import { facilitiesLfoUiSchema } from "apps/administration/app/data/jsonSchema/facilitiesLfo";
import { facilitiesSchemaLfo } from "apps/administration/app/data/jsonSchema/facilitiesLfo";

export const facilityInformationSchemaLfo: RJSFSchema = {
  title: "Facility Information",
  type: "object",
  properties: {
    facility_information_array: {
      type: "array",
      title: "Facility Information",
      items: {
        type: "object",
        properties: {
          ...facilitiesSchemaLfo.properties,
        },
      },
    },
  },
};

export const facilityInformationSchemaSfo: RJSFSchema = {
  ...facilitiesSchemaSfo,
  title: "Facility Information",
};

export const facilityInfoLfoUiSchema: UiSchema = {
  "ui:FieldTemplate": FieldTemplate,
  "ui:classNames": "form-heading-label",
  facility_information_array: {
    "ui:FieldTemplate": FieldTemplate,
    "ui:options": {
      label: false,
      arrayAddLabel: "Add facility",
      title: "Facility",
    },
    items: {
      ...facilitiesLfoUiSchema,
    },
  },
};

export const facilityInfoSfoUiSchema: UiSchema = {
  ...facilitiesSfoUiSchema,
  "ui:FieldTemplate": FieldTemplate,
  "ui:classNames": "form-heading-label",
};
