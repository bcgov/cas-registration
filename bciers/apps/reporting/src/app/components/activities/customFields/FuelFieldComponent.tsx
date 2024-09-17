"use client";
import { getDefaultRegistry } from "@rjsf/core";
import { FieldProps } from "@rjsf/utils";
const registry = getDefaultRegistry();

const ObjectField = registry.fields.ObjectField;

export const FuelFields: React.FunctionComponent<FieldProps> = (props) => {
  const handleChange = () => {
    props.onChange({
      ...props.formData,
      fuelClassification: "Woody Biomass",
      fuelUnit: "kilolitres",
    });
  };

  return <ObjectField {...props} onChange={handleChange} />;
};

export default FuelFields;
