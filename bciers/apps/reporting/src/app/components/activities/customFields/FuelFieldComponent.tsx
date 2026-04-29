"use client";
import { getDefaultRegistry } from "@rjsf/core";
import { FieldProps } from "@rjsf/utils";
import { actionHandler } from "@bciers/actions";
import { useState } from "react";

const registry = getDefaultRegistry();

const ObjectField = registry.fields.ObjectField;

export const FuelFields: React.FunctionComponent<FieldProps> = (props) => {
  const [helpText, setHelpText] = useState<string | undefined>(undefined);

  const handleChange = async (fuelNameChange: string) => {
    // prevent sending empty fuel name to the API and causing a 404
    if (!fuelNameChange) {
      setHelpText(undefined);
      props.onChange(
        {
          ...props.formData,
          fuelName: "",
          fuelClassification: "",
          fuelUnit: "",
        },
        props.fieldPathId.path,
      );
      return;
    }
    // //encode fuel name to handle `#` in URL as it was being treated as a fragment identifier, causing data loss when sent in the query string
    const fuelName = encodeURIComponent(fuelNameChange);
    const fuelData = await actionHandler(
      `reporting/fuel?fuel_name=${fuelName}`,
      "GET",
      "",
    );
    setHelpText(fuelData.description ?? undefined);
    props.onChange(
      {
        ...props.formData,
        fuelName: fuelData.name,
        fuelClassification: fuelData.classification,
        fuelUnit: fuelData.unit,
      },
      props.fieldPathId.path,
    );
  };

  return (
    <ObjectField
      {...props}
      onChange={handleChange}
      uiSchema={{
        ...props.uiSchema,
        fuelName: {
          ...props.uiSchema?.fuelName,
          "ui:help": helpText,
        },
      }}
    />
  );
};

export default FuelFields;
