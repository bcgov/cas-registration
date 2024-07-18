"use client";
import FormBase from "@bciers/components/form/FormBase";
import defaultTheme from "@bciers/components/form/theme/defaultTheme";
import { RJSFSchema } from "@rjsf/utils";
import FieldTemplate from "@bciers/components/form/fields/FieldTemplate";
import ArrayFieldTemplate from "@bciers/components/form/fields/ArrayFieldTemplate";
import SourceTypeBoxTemplate from "@bciers/components/form/fields/SourceTypeBoxTemplate";
import CheckboxWidgetLeft from "@bciers/components/form/widgets/CheckboxWidgetLeft";
import Form from "@rjsf/mui"
import { customizeValidator } from "@rjsf/validator-ajv8";
import InlineFieldTemplate from "@bciers/components/form/fields/InlineFieldTemplate";

interface Props {
  schema: RJSFSchema;
}

const uiSchema = {
  "ui:FieldTemplate": FieldTemplate,
  "ui:classNames": "form-heading-label",
  gcsWithProductionOfUsefulEnergy :{
    "ui:FieldTemplate": FieldTemplate,
    "ui:widget": CheckboxWidgetLeft,
    "ui:options": {
      label: false,
    },
  },
  gcsWithoutProductionOfUsefulEnergy :{
    "ui:FieldTemplate": FieldTemplate,
    "ui:widget": CheckboxWidgetLeft,
    "ui:options": {
      label: false,
    },
  },
  sourceTypes: {
    "ui:FieldTemplate": FieldTemplate,
    "ui:options": {
      label:false
    },
    gcsWithProductionOfUsefulEnergy: {
      "ui:FieldTemplate": SourceTypeBoxTemplate,
      units: {
        "ui:FieldTemplate": FieldTemplate,
        items:{
          "ui:order": [
            "gscUnitName",
            "gscUnitType",
            "description",
            "fuels"
          ],
          gscUnitName: {
            "ui:FieldTemplate": InlineFieldTemplate
          },
          gscUnitType: {
            "ui:FieldTemplate": InlineFieldTemplate
          },
          description: {
            "ui:FieldTemplate": InlineFieldTemplate
          },
          fuels: {
            "ui:title": "Fuel Information",
            "ui:FieldTemplate": FieldTemplate,
            items:{
              "ui:order": [
                "fuelName",
                "fuelUnit",
                "annualFuelAmount",
                "emissions"
              ],
              fuelName: {
                "ui:FieldTemplate": InlineFieldTemplate
              },
              fuelType: {
                "ui:FieldTemplate": InlineFieldTemplate
              },
              annualFuelAmount: {
                "ui:FieldTemplate": InlineFieldTemplate
              },
              emissions: {
                "ui:FieldTemplate": FieldTemplate,
              }
            },
          }
        },
      },
    },
    gcsWithoutProductionOfUsefulEnergy: {
      "ui:FieldTemplate": SourceTypeBoxTemplate,
    }
  },
};


const testSchema = {
  "title": "A registration form",
  "description": "A simple form example.",
  "type": "object",
  "required": [
    "firstName",
    "lastName"
  ],
  "properties": {
    "firstName": {
      "type": "string",
      "title": "First name",
      "default": "Chuck"
    },
    "lastName": {
      "type": "string",
      "title": "Last name"
    },
    "age": {
      "type": "integer",
      "title": "Age"
    },
    "bio": {
      "type": "string",
      "title": "Bio"
    },
    "password": {
      "type": "string",
      "title": "Password",
      "minLength": 3
    },
    "telephone": {
      "type": "string",
      "title": "Telephone",
      "minLength": 10
    }
  }
}

// 🧩 Main component
export default function Gsc({schema}: Readonly<Props>) {
  console.log(schema)

  const customFormats = {
    phone: /\(?\d{3}\)?[\s-]?\d{3}[\s-]?\d{4}$/,
    "postal-code":
      /^[ABCEGHJ-NPRSTVXY]\d[ABCEGHJ-NPRSTV-Z][ -]?\d[ABCEGHJ-NPRSTV-Z]\d$/i,
    bc_corporate_registry_number: "^[A-Za-z]{1,3}\\d{7}$",
  };

  const validator = customizeValidator({ customFormats });

  console.log("TEST SCHEMA: ",testSchema)
  // Render the DataGrid component
  return (
    <>
    {/* <Form
      schema={schema}
      uiSchema={uiSchema}
      validator={validator}
      onChange={(c: any) => console.log('CHANGE: ', c)}
      onError={(e: any) => console.log('ERROR: ', e)}
      onSubmit={() => console.log('submit')}
    /> */}
      <FormBase
        schema={schema}
        uiSchema={uiSchema}
        validator={validator}
        onChange={(c: any) => console.log('CHANGE: ', c)}
        onError={(e: any) => console.log('ERROR: ', e)}
        onSubmit={() => console.log('submit')}
      >
      </FormBase>
    </>
  );
}
