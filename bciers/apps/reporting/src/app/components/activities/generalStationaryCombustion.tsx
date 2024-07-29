"use client";
import ActivityForm from "./ActivityForm";
import FieldTemplate from "@bciers/components/form/fields/FieldTemplate";
import NestedArrayFieldTemplate from "@bciers/components/form/fields/NestedArrayFieldTemplate";
import SourceTypeBoxTemplate from "@bciers/components/form/fields/SourceTypeBoxTemplate";
import CheckboxWidgetLeft from "@bciers/components/form/widgets/CheckboxWidgetLeft";
import InlineFieldTemplate from "@bciers/components/form/fields/InlineFieldTemplate";

interface Props {
  activityData: {activityId: number, sourceTypeMap:{[key: number]: string}},
  reportDate: string,
}

// 🧩 Main component
export default function GeneralStationaryCombustion({activityData, reportDate}:Readonly<Props>) {
  const uiSchema = {
    "ui:FieldTemplate": FieldTemplate,
    "ui:classNames": "form-heading-label",
    gscWithProductionOfUsefulEnergy :{
      "ui:FieldTemplate": FieldTemplate,
      "ui:widget": CheckboxWidgetLeft,
      "ui:options": {
        label: false,
      },
    },
    gscWithoutProductionOfUsefulEnergy :{
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
      gscWithProductionOfUsefulEnergy: {
        "ui:FieldTemplate": SourceTypeBoxTemplate,
        units: {
          "ui:ArrayFieldTemplate": NestedArrayFieldTemplate,
          "ui:FieldTemplate": FieldTemplate,
          "ui:title": "Unit Data",
          "ui:options": {
            arrayAddLabel: 'Add Unit',
            label: false,
            title: 'Unit',
            padding: 'p-2'
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
                arrayAddLabel: 'Add Fuel',
                label: false,
                title: 'Fuel'
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
                    arrayAddLabel: 'Add Emission',
                    title: 'Emission',
                    label: false,
                    verticalBorder: true
                  },
                }
              },
            }
          },
        },
      },
      gscWithoutProductionOfUsefulEnergy: {
        "ui:FieldTemplate": SourceTypeBoxTemplate,
        units: {
          "ui:ArrayFieldTemplate": NestedArrayFieldTemplate,
          "ui:FieldTemplate": FieldTemplate,
          "ui:title": "Unit Data",
          "ui:options": {
            arrayAddLabel: 'Add Unit',
            label: false,
            title: 'Unit',
            padding: 'p-2'
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
                arrayAddLabel: 'Add Fuel',
                label: false,
                title: 'Fuel'
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
                    arrayAddLabel: 'Add Emission',
                    title: 'Emission',
                    label: false,
                    verticalBorder: true
                  },
                }
              },
            }
          },
        },
      }
    },
  };

  return (
    <ActivityForm activityData={activityData} reportDate={reportDate} uiSchema={uiSchema}/>
  );
}
