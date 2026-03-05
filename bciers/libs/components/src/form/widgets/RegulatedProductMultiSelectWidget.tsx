"use client";

import MultiSelectWidgetWithTooltip from "@bciers/components/form/widgets/MultiSelectWidgetWithTooltip";
import { WidgetProps } from "@rjsf/utils";

const RegulatedProductMultiSelectWidget = (props: WidgetProps) => {
  const value = Array.isArray(props.value) ? props.value : [];
  const selectedIds = value.map((item) => Number(item));

  const chemicalPulpProductId = 16;
  const limeRecoveredByKilnProductId = 43;

  const hasChemicalPulp = selectedIds.includes(chemicalPulpProductId);
  const hasLimeRecovered = selectedIds.includes(limeRecoveredByKilnProductId);
  const showPulpPaperHelp =
    (hasChemicalPulp && !hasLimeRecovered) ||
    (!hasChemicalPulp && hasLimeRecovered);

  const helpText = showPulpPaperHelp ? (
    <>
      <strong>Note: </strong>If this is a chemical pulp mill that recovered lime
      by kiln, select both 'Pulp and paper: chemical pulp' and 'Pulp and paper:
      lime recovered by kiln'
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
