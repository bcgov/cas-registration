"use client";
import React, { useId, useState } from "react";
import { CalculateOutlined, ExpandLess, ExpandMore } from "@mui/icons-material";
import {
  ComplianceSummaryFormProduct,
  EmissionsAttributableForComplianceEmissionRow,
  EmissionsAttributableForComplianceTotals,
  EmissionsAttributableForComplianceUnregulatedProductRow,
  ProductionPeriod,
} from "@reporting/src/app/components/complianceSummary/types";

interface Props {
  emissionsAttributableForComplianceTotals: EmissionsAttributableForComplianceTotals;
  productionPeriod: ProductionPeriod;
  isNewEntrant: boolean;
  products: ComplianceSummaryFormProduct[];
  emissionsAttributableForCompliance: string;
  reportingYear: number;
}

type Section = {
  title: string;
  formulaLabel: string;
  value: string;
  rows: EmissionsAttributableForComplianceEmissionRow[];
};

const UNIT = "tCO2e";
const EMPTY = "-";

// Emissions are shown to 4 decimal places, without thousands separators (e.g. 3220.7895)
export const formatEmissions = (value: string | number | undefined) => {
  const rounded = Number(Number(value ?? 0).toFixed(4));
  if (!Number.isFinite(rounded) || rounded === 0) return "0";
  return rounded.toFixed(4);
};

export const formatQuantity = (value: string | number | undefined) =>
  Number(value ?? 0).toLocaleString("en-CA", { maximumFractionDigits: 4 });

const PERIOD_LABELS: Record<Exclude<ProductionPeriod, "annual">, string> = {
  apr_dec: "April 1 - December 31",
  jan_mar: "January 1 - March 31",
};

const PERIOD_PRODUCTION_FIELD: Record<
  Exclude<ProductionPeriod, "annual">,
  "apr_dec_production" | "jan_mar_production"
> = {
  apr_dec: "apr_dec_production",
  jan_mar: "jan_mar_production",
};

const UNREGULATED_PRODUCTS_TITLE = "Allocated to unregulated products";

const getSections = (
  emissionsAttributableForComplianceTotals: EmissionsAttributableForComplianceTotals,
): Section[] => [
  {
    title: "Emissions attributable for reporting",
    formulaLabel: "emissions attributable for reporting",
    value: emissionsAttributableForComplianceTotals.attributable_for_reporting,
    rows:
      emissionsAttributableForComplianceTotals.attributable_for_reporting_rows ??
      [],
  },
  {
    title: "Excluded emissions by fuels",
    formulaLabel: "excluded emissions by fuels",
    value: emissionsAttributableForComplianceTotals.excluded_by_fuels,
    rows: emissionsAttributableForComplianceTotals.excluded_by_fuels_rows ?? [],
  },
  {
    title: "Non-useful venting",
    formulaLabel: "non-useful venting emissions",
    value: emissionsAttributableForComplianceTotals.non_useful_venting,
    rows:
      emissionsAttributableForComplianceTotals.non_useful_venting_rows ?? [],
  },
  {
    title: "Fugitive emissions",
    formulaLabel: "fugitive emissions",
    value: emissionsAttributableForComplianceTotals.fugitive,
    rows: emissionsAttributableForComplianceTotals.fugitive_rows ?? [],
  },
  {
    title: "Remaining NPNC",
    formulaLabel:
      "remaining NPNC (NPNC emissions - emissions excluded by fuel, non-useful venting, fugitive)",
    value: emissionsAttributableForComplianceTotals.remaining_npnc,
    rows: emissionsAttributableForComplianceTotals.remaining_npnc_rows ?? [],
  },
];

const headerCellClass = "py-1 pr-2 text-sm font-bold align-bottom";
const bodyCellClass = "py-1 pr-2 text-sm align-top";

const TotalRow: React.FC<{ colSpan: number; value: string }> = ({
  colSpan,
  value,
}) => (
  <tfoot>
    <tr>
      <td colSpan={colSpan} />
      <td className="py-1 text-sm font-bold text-right whitespace-nowrap">
        total {formatEmissions(value)}
      </td>
    </tr>
  </tfoot>
);

const EmissionsSection: React.FC<{ section: Section }> = ({ section }) => (
  <section className="mt-4">
    <h4 className="text-lg font-bold my-1">{section.title}</h4>
    <table className="w-full table-fixed border-collapse text-left">
      <colgroup>
        <col className="w-[30%]" />
        <col className="w-[35%]" />
        <col className="w-[18%]" />
        <col className="w-[17%]" />
      </colgroup>
      <thead>
        <tr>
          <th scope="col" className={headerCellClass}>
            Activity
          </th>
          <th scope="col" className={headerCellClass}>
            Source type
          </th>
          <th scope="col" className={headerCellClass}>
            Fuel name
          </th>
          <th scope="col" className={`${headerCellClass} pr-0 text-right`}>
            Emissions
          </th>
        </tr>
      </thead>
      <tbody>
        {section.rows.length === 0 ? (
          <tr>
            <td className={bodyCellClass}>{EMPTY}</td>
            <td className={bodyCellClass}>{EMPTY}</td>
            <td className={bodyCellClass}>{EMPTY}</td>
            <td className={`${bodyCellClass} pr-0 text-right`}>{EMPTY}</td>
          </tr>
        ) : (
          section.rows.map((row) => (
            <tr
              key={`${row.activity}|${row.source_type}|${row.fuel_name ?? ""}`}
            >
              <td className={bodyCellClass}>{row.activity}</td>
              <td className={bodyCellClass}>{row.source_type}</td>
              <td className={bodyCellClass}>{row.fuel_name || EMPTY}</td>
              <td className={`${bodyCellClass} pr-0 text-right`}>
                {formatEmissions(row.emissions)}
              </td>
            </tr>
          ))
        )}
      </tbody>
      {section.rows.length > 1 && (
        <TotalRow colSpan={3} value={section.value} />
      )}
    </table>
  </section>
);

// Remaining NPNC is allocated to unregulated products but subtracted on its own line, so it is taken out here
const UnregulatedProductsSection: React.FC<{
  rows: EmissionsAttributableForComplianceUnregulatedProductRow[];
  remainingNpnc: string;
  value: string;
}> = ({ rows, remainingNpnc, value }) => {
  const showsNpncAdjustment = Number(remainingNpnc) > 0;
  return (
    <section className="mt-4">
      <h4 className="text-lg font-bold my-1">{UNREGULATED_PRODUCTS_TITLE}</h4>
      <table className="w-full table-fixed border-collapse text-left">
        <colgroup>
          <col className="w-[83%]" />
          <col className="w-[17%]" />
        </colgroup>
        <thead>
          <tr>
            <th scope="col" className={headerCellClass}>
              Product
            </th>
            <th scope="col" className={`${headerCellClass} pr-0 text-right`}>
              Emissions
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.product_name}>
              <td className={bodyCellClass}>{row.product_name}</td>
              <td className={`${bodyCellClass} pr-0 text-right`}>
                {formatEmissions(row.allocated_emissions)}
              </td>
            </tr>
          ))}
          {showsNpncAdjustment && (
            <tr data-testid="emissions-attributable-for-compliance-npnc-adjustment">
              <td className={bodyCellClass}>Less remaining NPNC</td>
              <td className={`${bodyCellClass} pr-0 text-right`}>
                -{formatEmissions(remainingNpnc)}
              </td>
            </tr>
          )}
        </tbody>
        {rows.length + (showsNpncAdjustment ? 1 : 0) > 1 && (
          <TotalRow colSpan={1} value={value} />
        )}
      </table>
    </section>
  );
};

const EmissionsAttributableForComplianceCalculationBreakdown: React.FC<
  Props
> = ({
  emissionsAttributableForComplianceTotals,
  productionPeriod,
  isNewEntrant,
  products,
  emissionsAttributableForCompliance,
  reportingYear,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const panelId = useId();

  const isPartialYear = productionPeriod !== "annual";
  const showsAnnualEmissionsAttributableForCompliance = isPartialYear;
  const showStep2 = isPartialYear && !isNewEntrant;

  const resultValue = showsAnnualEmissionsAttributableForCompliance
    ? emissionsAttributableForComplianceTotals.annual_emissions_attributable_for_compliance
    : emissionsAttributableForCompliance;

  const step1Title = showsAnnualEmissionsAttributableForCompliance
    ? "Annual emissions attributable for compliance"
    : "Emissions attributable for compliance";

  const sections = getSections(emissionsAttributableForComplianceTotals);
  const showUnregulatedProducts =
    Number(
      emissionsAttributableForComplianceTotals.allocated_to_unregulated_products,
    ) > 0;

  const formulaTerms = sections.map((s) => s.formulaLabel);
  const substitutionTerms = sections.map((s) => formatEmissions(s.value));
  if (showUnregulatedProducts) {
    formulaTerms.push("emissions allocated to unregulated products");
    substitutionTerms.push(
      formatEmissions(
        emissionsAttributableForComplianceTotals.allocated_to_unregulated_products,
      ),
    );
  }

  const prorationSubstitution = showStep2
    ? products
        .map((product) => {
          const annualEmissions = formatEmissions(
            product.allocated_for_compliance_annual,
          );
          const periodProduction = formatQuantity(
            product[
              PERIOD_PRODUCTION_FIELD[
                productionPeriod as Exclude<ProductionPeriod, "annual">
              ]
            ],
          );
          const annualProduction = formatQuantity(product.annual_production);
          return `(${annualEmissions} × ${periodProduction} ÷ ${annualProduction})`;
        })
        .join(" + ") || "0"
    : "";

  return (
    <div className="mb-4">
      <button
        type="button"
        className="inline-flex items-center gap-1 text-bc-link-blue cursor-pointer border-none bg-transparent p-0 text-base"
        aria-expanded={isExpanded}
        aria-controls={panelId}
        onClick={() => setIsExpanded((prev) => !prev)}
      >
        <CalculateOutlined fontSize="small" aria-hidden="true" />
        How was this calculated?
        {isExpanded ? (
          <ExpandLess
            fontSize="small"
            aria-hidden="true"
            data-testid="emissions-attributable-for-compliance-toggle-collapse-icon"
          />
        ) : (
          <ExpandMore
            fontSize="small"
            aria-hidden="true"
            data-testid="emissions-attributable-for-compliance-toggle-expand-icon"
          />
        )}
      </button>

      <div
        id={panelId}
        hidden={!isExpanded}
        className="mt-2 p-6 border border-solid border-bc-bg-blue rounded bg-bc-white"
        data-testid="emissions-attributable-for-compliance-calculation-breakdown"
      >
        {isNewEntrant ? (
          <p
            className="my-0"
            data-testid="emissions-attributable-for-compliance-new-entrant-note"
          >
            <b>Note:</b> New entrant operations have no compliance obligation,
            so emissions attributable for compliance = 0.
          </p>
        ) : (
          <>
            <div className="p-4 rounded bg-bc-bg-grey">
              <h3 className="text-lg font-bold my-0">{step1Title}</h3>
              <p
                className="my-0"
                data-testid="emissions-attributable-for-compliance-formula"
              >
                = {formulaTerms.join(" - ")}
              </p>
              <p
                className="my-0"
                data-testid="emissions-attributable-for-compliance-substitution"
              >
                = {substitutionTerms.join(" - ")}
              </p>
              <p
                className="my-0 font-bold"
                data-testid="emissions-attributable-for-compliance-step1-result"
              >
                = {formatEmissions(resultValue)} {UNIT}
              </p>
            </div>

            {sections.map((section) => (
              <EmissionsSection key={section.title} section={section} />
            ))}
            {showUnregulatedProducts && (
              <UnregulatedProductsSection
                rows={
                  emissionsAttributableForComplianceTotals.unregulated_product_rows ??
                  []
                }
                remainingNpnc={
                  emissionsAttributableForComplianceTotals.remaining_npnc
                }
                value={
                  emissionsAttributableForComplianceTotals.allocated_to_unregulated_products
                }
              />
            )}

            {showStep2 && (
              <>
                <div className="mt-6 p-4 rounded bg-bc-bg-grey">
                  <h3 className="text-lg font-bold my-0">
                    Prorate to {PERIOD_LABELS[productionPeriod]},{" "}
                    {reportingYear}
                  </h3>
                  <p className="my-0">
                    = sum of (annual emissions attributable for compliance ×
                    production for {PERIOD_LABELS[productionPeriod]} ÷ annual
                    production), per regulated product
                  </p>
                  <p
                    className="my-0"
                    data-testid="emissions-attributable-for-compliance-step2-substitution"
                  >
                    = {prorationSubstitution}
                  </p>
                  <p
                    className="my-0 font-bold"
                    data-testid="emissions-attributable-for-compliance-step2-result"
                  >
                    = {formatEmissions(emissionsAttributableForCompliance)}{" "}
                    {UNIT}
                  </p>
                </div>
                <table className="w-full mt-4 border-collapse text-left">
                  <thead>
                    <tr>
                      <th scope="col" className={headerCellClass}>
                        Product
                      </th>
                      <th scope="col" className={headerCellClass}>
                        Annual emissions
                      </th>
                      <th scope="col" className={headerCellClass}>
                        Production for {PERIOD_LABELS[productionPeriod]}
                      </th>
                      <th scope="col" className={headerCellClass}>
                        Annual production
                      </th>
                      <th
                        scope="col"
                        className={`${headerCellClass} pr-0 text-right`}
                      >
                        Prorated emissions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((product) => (
                      <tr key={product.name}>
                        <th
                          scope="row"
                          className={`${bodyCellClass} font-normal`}
                        >
                          {product.name}
                        </th>
                        <td className={bodyCellClass}>
                          {formatEmissions(
                            product.allocated_for_compliance_annual,
                          )}
                        </td>
                        <td className={bodyCellClass}>
                          {formatQuantity(
                            product[PERIOD_PRODUCTION_FIELD[productionPeriod]],
                          )}{" "}
                          {product.unit}
                        </td>
                        <td className={bodyCellClass}>
                          {formatQuantity(product.annual_production)}{" "}
                          {product.unit}
                        </td>
                        <td className={`${bodyCellClass} pr-0 text-right`}>
                          {formatEmissions(
                            product.allocated_compliance_emissions,
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr>
                      <td colSpan={4} />
                      <td
                        className="py-1 text-sm font-bold text-right whitespace-nowrap"
                        data-testid="emissions-attributable-for-compliance-step2-total"
                      >
                        total{" "}
                        {formatEmissions(emissionsAttributableForCompliance)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default EmissionsAttributableForComplianceCalculationBreakdown;
