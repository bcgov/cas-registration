"use client"
// import { actionHandler } from "@/app/utils/actions";
import Form  from "@rjsf/core";
import { RJSFSchema } from '@rjsf/utils';
import validator from '@rjsf/validator-ajv8';
import { useState } from 'react'

const buildTestSchema = (gasTypes: string[], methodologies: string[]) => {
  const schema: RJSFSchema = {
    type: 'object',
    properties: {

      fuelType: { type: 'string', title: 'Fuel Type'},
      fuelAmount: { type: 'number', title: 'Fuel Amount'},
      gasType: { type: 'string', title: 'Gas Type', enum: gasTypes}
    },
    dependencies: {
      gasType: {
        properties: {
          emission: {type: 'number', title: 'Emissions'},
          equivalentEmission: {type: 'number', title: 'Equivalent Emissions(CO2e)'},
          methodology: {type: 'string', title: 'Methodology', enum: methodologies}
        },
      }
    }
  };

  return schema;
}

// 🧩 Main component
export default function FormComponent(params: {gasTypes: string[], methodologies: string[], methodologyFields: string}) {
  const [conditionalFormData, setConditionalFormData] = useState({gasType: null, methodology: null});
  const [formData, setFormData] = useState({})
  const {gasTypes, methodologies, methodologyFields} = params;
  const schema = buildTestSchema(gasTypes, methodologies);
  let conditionalSchema: any;


  if (methodologyFields) {
    const parsedFields = JSON.parse(methodologyFields)
    conditionalSchema = {
      type: 'object',
      properties: {

        fuelType: { type: 'string', title: 'Fuel Type'},
        fuelAmount: { type: 'number', title: 'Fuel Amount'},
        gasType: { type: 'string', title: 'Gas Type', enum: gasTypes}
      },
      dependencies: {
        gasType: {
          properties: {
            emission: {type: 'number', title: 'Emissions'},
            equivalentEmission: {type: 'number', title: 'Equivalent Emissions(CO2e)'},
            methodology: {type: 'string', title: 'Methodology', enum: methodologies}
          },
        }
      }
    };
    parsedFields.forEach(({fieldName, fieldType}) => {
      conditionalSchema.dependencies.gasType.properties[fieldName] = {type: fieldType}
    });
  };

  return (
    <>
      <h2>General Stationary Combustion</h2>
      <h3>Source Type 1</h3>
      <Form
        validator={validator}
        formData={formData}
        schema={conditionalFormData?.methodology && methodologyFields ? conditionalSchema : schema}
        allowBackNavigation
        onSubmit={() => console.log('submit form')}
        onChange={(c:any) => {
          setFormData(c.formData);
          setConditionalFormData({gasType: c.formData?.gasType, methodology: c.formData?.methodology})
          }}
      />
    </>
  );
}
