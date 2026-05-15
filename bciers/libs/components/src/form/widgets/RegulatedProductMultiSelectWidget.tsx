"use client";

import MultiSelectWidgetWithTooltip, {
  FieldSchemaWithTooltip,
} from "@bciers/components/form/widgets/MultiSelectWidgetWithTooltip";
import { WidgetProps } from "@rjsf/utils";

export const CHEMICAL_PULP_NAME = "Pulp and paper: chemical pulp";
export const LIME_RECOVERED_NAME = "Pulp and paper: lime recovered by kiln";

const RegulatedProductMultiSelectWidget = (props: WidgetProps) => {
  const value = Array.isArray(props.value) ? props.value : [];
  const selectedIds = value.map((item) => Number(item));

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

  const showPulpPaperHelp =
    (hasChemicalPulp && !hasLimeRecovered) ||
    (!hasChemicalPulp && hasLimeRecovered);

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
      uiSchema={{
        ...props.uiSchema,
        "ui:help": helpText as any, // must be cast as any to satisfy uiSchema which wants a string, but the underlying TextField supports a ReactNode
      }}
    />
  );
};

export default RegulatedProductMultiSelectWidget;
