"use client";
import FormBase from "@bciers/components/form/FormBase";
import { RJSFSchema } from "@rjsf/utils";
import FieldTemplate from "@bciers/components/form/fields/FieldTemplate";
import NestedArrayFieldTemplate from "@bciers/components/form/fields/NestedArrayFieldTemplate";
import SourceTypeBoxTemplate from "@bciers/components/form/fields/SourceTypeBoxTemplate";
import CheckboxWidgetLeft from "@bciers/components/form/widgets/CheckboxWidgetLeft";
import { customizeValidator } from "@rjsf/validator-ajv8";
import InlineFieldTemplate from "@bciers/components/form/fields/InlineFieldTemplate";
import { useEffect, useState } from "react";
import { actionHandler } from "@bciers/actions";
import { Alert, Button } from "@mui/material";

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
    gscWithoutProductionOfUsefulEnergy: {
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
export default function Gsc() {
  // 🐜 To display errors
  const [errorList, setErrorList] = useState([] as any[]);
  // 🌀 Loading state for the Submit button
  const [isLoading, setIsLoading] = useState(false);
  // ✅ Success state for for the Submit button
  const [isSuccess, setIsSuccess] = useState(false);
  const [formState, setFormState] = useState({})
  const [jsonSchema, setJsonSchema] = useState({})


  // let jsonSchema = {}

  useEffect(() => {
    const fetchSchemaData = async (queryString: string) => {
      // fetch data from server
      const schemaData = await actionHandler(`reporting/build-form-schema?activity=1&report_date=2024-04-01${queryString}`, "GET", "");
      setJsonSchema(JSON.parse(schemaData).schema);
    };
    let qs = '';
    if (formState?.gscWithProductionOfUsefulEnergy) qs = qs + '&source_types[]=1';
    if (formState?.gscWithoutProductionOfUsefulEnergy) qs = qs + '&source_types[]=2';
    fetchSchemaData(qs);
  }, [formState?.gscWithProductionOfUsefulEnergy, formState?.gscWithoutProductionOfUsefulEnergy])

  const customFormats = {
    phone: /\(?\d{3}\)?[\s-]?\d{3}[\s-]?\d{4}$/,
    "postal-code":
      /^[ABCEGHJ-NPRSTVXY]\d[ABCEGHJ-NPRSTV-Z][ -]?\d[ABCEGHJ-NPRSTV-Z]\d$/i,
    bc_corporate_registry_number: "^[A-Za-z]{1,3}\\d{7}$",
  };

  const validator = customizeValidator({ customFormats });

  const handleFormChange = (c: any) => {
    console.log("IN CHANGE: ", c.formData)
    setFormState(c.formData);
  }

  // 🛠️ Function to submit user form data to API
  const submitHandler = async (data: { formData?: any }) => {
    //Set states
    setErrorList([]);
    setIsLoading(true);
    setIsSuccess(false);
    const response = {status: 200, error: false}
    // 🛑 Set loading to false after the API call is completed
    setIsLoading(false);

    if (response.error) {
      setErrorList([{ message: response.error }]);
      return;
    }

    // Apply new data to NextAuth JWT
    console.log('SUBMITTED: ', data.formData)
  };

  // Render the DataGrid component
  return (
    <>
      <FormBase
        schema={jsonSchema}
        formData={formState}
        uiSchema={uiSchema}
        validator={validator}
        onChange={handleFormChange}
        onError={(e: any) => console.log('ERROR: ', e)}
        onSubmit={submitHandler}
      >

      {errorList.length > 0 &&
        errorList.map((e: any) => (
          <Alert key={e.message} severity="error">
            {e?.stack ?? e.message}
          </Alert>
        ))}
      <div className="flex justify-end gap-3">
        {/* Disable the button when loading or when success state is true */}
        <Button
          variant="contained"
          type="submit"
          aria-disabled={isLoading}
          disabled={isLoading}
        >
          {isSuccess ? "✅ Success" : "Submit"}
        </Button>
      </div>
      </FormBase>
    </>
  );
}
