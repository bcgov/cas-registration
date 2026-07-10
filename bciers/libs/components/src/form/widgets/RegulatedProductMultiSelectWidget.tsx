"use client";

import MultiSelectWidgetWithTooltip, {
  FieldSchemaWithTooltip,
} from "@bciers/components/form/widgets/MultiSelectWidgetWithTooltip";
import { WidgetProps } from "@rjsf/utils";

export const CHEMICAL_PULP_NAME = "Pulp and paper: chemical pulp";
export const LIME_RECOVERED_NAME = "Pulp and paper: lime recovered by kiln";
interface RegulatedProductFormContext {
  reportingYear?: number;
}

const RegulatedProductMultiSelectWidget = ({
  value,
  registry,
  ...props
}: WidgetProps) => {
  const selectedIds = Array.isArray(value) ? value.map(Number) : [];

  const fieldSchema = props.schema?.items as FieldSchemaWithTooltip;
  const enumIds = fieldSchema?.enum ?? [];
  const enumNames = (props.uiSchema?.["ui:enumNames"] as string[]) ?? [];

  const chemicalPulpProductId = enumIds[enumNames.indexOf(CHEMICAL_PULP_NAME)];

  const limeRecoveredByKilnProductId =
    enumIds[enumNames.indexOf(LIME_RECOVERED_NAME)];

  const hasChemicalPulp =
    chemicalPulpProductId !== undefined &&
    selectedIds.includes(Number(chemicalPulpProductId));

  const hasLimeRecovered =
    limeRecoveredByKilnProductId !== undefined &&
    selectedIds.includes(Number(limeRecoveredByKilnProductId));

  // Show the warning only for > 2024 reports when exactly one of the
  // Chemical Pulp or Lime Recovered by Kiln products is selected.
  const { reportingYear } = registry.formContext as RegulatedProductFormContext;
  const showPulpPaperHelp =
    Number(reportingYear) > 2024 && hasChemicalPulp !== hasLimeRecovered;
  const helpText = showPulpPaperHelp ? (
    <>
      <strong>Note: </strong>If this is a chemical pulp mill that recovered lime
      by kiln, select both '{CHEMICAL_PULP_NAME}' and '{LIME_RECOVERED_NAME}'
    </>
  ) : (
    ""
  );

  return (
    <MultiSelectWidgetWithTooltip
      {...props}
      value={value}
      registry={registry}
      uiSchema={{
        ...props.uiSchema,
        "ui:help": helpText as any,
      }}
    />
  );
};

export default RegulatedProductMultiSelectWidget;
