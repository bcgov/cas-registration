"use client";
import { FieldTemplateProps } from "@rjsf/utils";
import InlineFieldTemplate from "@bciers/components/form/fields/InlineFieldTemplate";
import EmissionsAttributableForComplianceCalculationBreakdown from "@reporting/src/app/components/complianceSummary/EmissionsAttributableForComplianceCalculationBreakdown";

/**
 * Renders Emissions attributable for compliance field and "How was this calculated?"
 */
function EmissionsAttributableForComplianceFieldTemplate(
  props: FieldTemplateProps,
) {
  const {
    emissions_attributable_for_compliance_totals,
    production_period,
    is_new_entrant,
    products,
    emissions_attributable_for_compliance,
    reporting_year,
  } = props.registry.formContext ?? {};

  return (
    <>
      <InlineFieldTemplate {...props} />
      {emissions_attributable_for_compliance_totals && (
        <EmissionsAttributableForComplianceCalculationBreakdown
          emissionsAttributableForComplianceTotals={
            emissions_attributable_for_compliance_totals
          }
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

export default EmissionsAttributableForComplianceFieldTemplate;
