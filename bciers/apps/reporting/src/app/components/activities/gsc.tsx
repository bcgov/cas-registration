"use client";
import FormBase from "@bciers/components/form/FormBase";
import { RJSFSchema } from "@rjsf/utils";
import FieldTemplate from "@bciers/components/form/fields/FieldTemplate";
import NestedArrayFieldTemplate from "@bciers/components/form/fields/NestedArrayFieldTemplate";
import SourceTypeBoxTemplate from "@bciers/components/form/fields/SourceTypeBoxTemplate";
import CheckboxWidgetLeft from "@bciers/components/form/widgets/CheckboxWidgetLeft";
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
        "ui:ArrayFieldTemplate": NestedArrayFieldTemplate,
        "ui:FieldTemplate": FieldTemplate,
        "ui:title": "Unit Data",
        "ui:options": {
          arrayAddLabel: 'Add Unit'
        },
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
            "ui:title": "Fuel Data",
            "ui:ArrayFieldTemplate": NestedArrayFieldTemplate,
            "ui:FieldTemplate": FieldTemplate,
            "ui:options": {
              arrayAddLabel: 'Add Fuel'
            },
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
                "ui:ArrayFieldTemplate": NestedArrayFieldTemplate,
                "ui:FieldTemplate": FieldTemplate,
                "ui:options": {
                  arrayAddLabel: 'Add Emission'
                },
              }
            },
          }
        },
      },
    },
    gcsWithoutProductionOfUsefulEnergy: {
      "ui:FieldTemplate": SourceTypeBoxTemplate,
      units: {
        "ui:ArrayFieldTemplate": NestedArrayFieldTemplate,
        "ui:FieldTemplate": FieldTemplate,
        "ui:title": "Unit Data",
        "ui:options": {
          arrayAddLabel: 'Add Unit'
        },
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
            "ui:title": "Fuel Data",
            "ui:ArrayFieldTemplate": NestedArrayFieldTemplate,
            "ui:FieldTemplate": FieldTemplate,
            "ui:options": {
              arrayAddLabel: 'Add Fuel'
            },
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
                "ui:ArrayFieldTemplate": NestedArrayFieldTemplate,
                "ui:FieldTemplate": FieldTemplate,
                "ui:options": {
                  arrayAddLabel: 'Add Emission'
                },
              }
            },
          }
        },
      },
    }
  },
};

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

  // Render the DataGrid component
  return (
    <>
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
