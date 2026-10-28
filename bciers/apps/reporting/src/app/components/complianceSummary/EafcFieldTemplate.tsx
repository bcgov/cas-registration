"use client";
import { FieldTemplateProps } from "@rjsf/utils";
import InlineFieldTemplate from "@bciers/components/form/fields/InlineFieldTemplate";
import EafcCalculationBreakdown from "@reporting/src/app/components/complianceSummary/EafcCalculationBreakdown";

/**
 * Renders Emissions attributable for compliance field and "How was this calculated?"
 */
function EafcFieldTemplate(props: FieldTemplateProps) {
  const {
    eafc_totals,
    production_period,
    is_new_entrant,
    products,
    emissions_attributable_for_compliance,
    reporting_year,
  } = props.registry.formContext ?? {};

  return (
    <>
      <InlineFieldTemplate {...props} />
      {eafc_totals && (
        <EafcCalculationBreakdown
          eafcTotals={eafc_totals}
          productionPeriod={production_period ?? "annual"}
          isNewEntrant={Boolean(is_new_entrant)}
          products={products ?? []}
          emissionsAttributableForCompliance={
            emissions_attributable_for_compliance
          }
          reportingYear={reporting_year}
        />
      )}
    </>
  );
}

export default EafcFieldTemplate;
