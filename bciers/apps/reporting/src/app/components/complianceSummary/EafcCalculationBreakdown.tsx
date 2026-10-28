"use client";
import React, { useId, useState } from "react";
import {
  ComplianceSummaryFormProduct,
  EafcTotals,
  ProductionPeriod,
} from "@reporting/src/app/components/complianceSummary/types";

interface Props {
  eafcTotals: EafcTotals;
  productionPeriod: ProductionPeriod;
  isNewEntrant: boolean;
  products: ComplianceSummaryFormProduct[];
  emissionsAttributableForCompliance: string;
  reportingYear: number;
}

type Term = { label: string; value: string };

const UNIT = "tCO2e";

export const formatEmissions = (value: string | number | undefined) =>
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

const getSubtractedTerms = (eafcTotals: EafcTotals): Term[] => {
  const terms: Term[] = [
    {
      label: "Excluded emissions by fuels",
      value: eafcTotals.excluded_by_fuels,
    },
    { label: "Non-useful venting", value: eafcTotals.non_useful_venting },
    { label: "Fugitive emissions", value: eafcTotals.fugitive },
    { label: "Remaining NPNC", value: eafcTotals.remaining_npnc },
  ];
  if (Number(eafcTotals.allocated_to_unregulated_products) > 0) {
    terms.push({
      label: "Allocated to unregulated products",
      value: eafcTotals.allocated_to_unregulated_products,
    });
  }
  return terms;
};

const EafcCalculationBreakdown: React.FC<Props> = ({
  eafcTotals,
  productionPeriod,
  isNewEntrant,
  products,
  emissionsAttributableForCompliance,
  reportingYear,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const panelId = useId();

  const isPartialYear = productionPeriod !== "annual";
  const showsAnnualEafc = isPartialYear || isNewEntrant;
  const showStep2 = isPartialYear && !isNewEntrant;

  const resultLabel = showsAnnualEafc ? "Annual EAFC" : "EAFC";
  const resultValue = showsAnnualEafc
    ? eafcTotals.annual_eafc
    : emissionsAttributableForCompliance;

  const step1Title = showStep2
    ? "Step 1: Calculate annual emissions attributable for compliance"
    : showsAnnualEafc
      ? "Annual emissions attributable for compliance"
      : "Emissions attributable for compliance";

  const subtractedTerms = getSubtractedTerms(eafcTotals);
  const allTerms: Term[] = [
    {
      label: "Emissions attributable for reporting",
      value: eafcTotals.attributable_for_reporting,
    },
    ...subtractedTerms,
  ];

  const formula = `${resultLabel} = ${allTerms
    .map((t) => t.label)
    .join(" - ")}`;
  const substitution = `${resultLabel} = ${allTerms
    .map((t) => formatEmissions(t.value))
    .join(" - ")}`;

  return (
    <div className="mb-4">
      <button
        type="button"
        className="text-bc-link-blue underline cursor-pointer border-none bg-transparent p-0 text-base"
        aria-expanded={isExpanded}
        aria-controls={panelId}
        onClick={() => setIsExpanded((prev) => !prev)}
      >
        How was this calculated?
      </button>

      <div
        id={panelId}
        hidden={!isExpanded}
        className="mt-2 p-4 border border-solid border-bc-bg-dark-grey rounded bg-bc-bg-light-grey"
        data-testid="eafc-calculation-breakdown"
      >
        <h3 className="text-lg font-bold mt-0 mb-2">{step1Title}</h3>
        <p className="my-1">{formula}</p>
        <p className="my-1">{substitution}</p>
        <p className="my-1 font-bold" data-testid="eafc-step1-result">
          {resultLabel} = {formatEmissions(resultValue)} {UNIT}
        </p>

        <ul className="mt-3 mb-0 pl-5">
          {allTerms.map((term) => (
            <li key={term.label}>
              {term.label}: {formatEmissions(term.value)} {UNIT}
            </li>
          ))}
        </ul>

        {isNewEntrant && (
          <p className="mt-4 mb-0" data-testid="eafc-new-entrant-note">
            <b>Note:</b> New entrant operations have no compliance obligation,
            so EAFC = 0.
          </p>
        )}

        {showStep2 && (
          <>
            <h3 className="text-lg font-bold mt-6 mb-2">
              Step 2: Prorate to {PERIOD_LABELS[productionPeriod]},{" "}
              {reportingYear}
            </h3>
            <p className="my-1">
              EAFC = Sum of (Annual EAFC × Production for{" "}
              {PERIOD_LABELS[productionPeriod]} ÷ Annual production), per
              regulated product
            </p>
            <table className="w-full mt-3 border-collapse text-left">
              <thead>
                <tr>
                  <th scope="col" className="py-1 pr-2">
                    Product
                  </th>
                  <th scope="col" className="py-1 pr-2">
                    Annual EAFC ({UNIT})
                  </th>
                  <th scope="col" className="py-1 pr-2">
                    Production for {PERIOD_LABELS[productionPeriod]}
                  </th>
                  <th scope="col" className="py-1 pr-2">
                    Annual production
                  </th>
                  <th scope="col" className="py-1">
                    Prorated EAFC ({UNIT})
                  </th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.name}>
                    <th scope="row" className="py-1 pr-2 font-normal">
                      {product.name}
                    </th>
                    <td className="py-1 pr-2">
                      {formatEmissions(product.allocated_for_compliance_annual)}
                    </td>
                    <td className="py-1 pr-2">
                      {formatEmissions(
                        product[PERIOD_PRODUCTION_FIELD[productionPeriod]],
                      )}{" "}
                      {product.unit}
                    </td>
                    <td className="py-1 pr-2">
                      {formatEmissions(product.annual_production)}{" "}
                      {product.unit}
                    </td>
                    <td className="py-1">
                      {formatEmissions(product.allocated_compliance_emissions)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="font-bold border-t border-solid border-0 border-bc-bg-dark-grey">
                  <th scope="row" colSpan={4} className="py-1 pr-2">
                    Emissions attributable for compliance
                  </th>
                  <td className="py-1" data-testid="eafc-step2-total">
                    {formatEmissions(emissionsAttributableForCompliance)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </>
        )}
      </div>
    </div>
  );
};

export default EafcCalculationBreakdown;
