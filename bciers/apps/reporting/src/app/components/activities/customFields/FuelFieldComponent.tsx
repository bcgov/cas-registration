"use client";
import { getDefaultRegistry } from "@rjsf/core";
import { FieldProps } from "@rjsf/utils";
import { actionHandler } from "@bciers/actions";
import { IChangeEvent } from "@rjsf/core";
const registry = getDefaultRegistry();

interface FuelDataChangeEvent extends IChangeEvent {
  fuelName: string;
}

const ObjectField = registry.fields.ObjectField;

export const FuelFields: React.FunctionComponent<FieldProps> = (props) => {
  const handleChange = async (c: FuelDataChangeEvent) => {
    const fuelData = await actionHandler(
      `reporting/fuel?fuel_name=${c.fuelName}`,
      "GET",
      "",
    );
    props.onChange({
      ...props.formData,
      fuelName: fuelData.name,
      fuelClassification: fuelData.classification,
      fuelUnit: fuelData.unit,
    });
  };

  return <ObjectField {...props} onChange={handleChange} />;
};

export default FuelFields;
