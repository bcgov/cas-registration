"use client"
// import { actionHandler } from "@/app/utils/actions";
import Form  from "@rjsf/core";
import { RJSFSchema } from '@rjsf/utils';
import validator from '@rjsf/validator-ajv8';

const buildTestSchema = (gasTypes: string[], methodologies: string[]) => {
  console.log(methodologies)
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
export default async function FormComponent(params: {gasTypes: string[], methodologies: string[]}) {
  console.log(params)
  const {gasTypes, methodologies} = params;
  const schema = buildTestSchema(gasTypes, methodologies);
  return (
    <>
      <h2>General Stationary Combustion</h2>
      <h3>Source Type 1</h3>
      <Form
      validator={validator}
      schema={schema}
      allowBackNavigation
      onSubmit={() => console.log('submit form')}
      />
    </>
  );
}
