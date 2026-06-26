import { Grid, Paper } from "@mui/material";
import { FinalReviewCard } from "./FinalReviewSection";
import { regularHeaderStyle } from "./styles";
import { byLabel, excludeFromEntries, renderFieldList } from "./fieldLists";

const ComplianceValue: React.FC<{
  title: string;
  value: string | number;
  unit?: string;
  colour?: "blue" | "green";
}> = ({ title, value, unit = "tCO2e", colour = "blue" }) => {
  return (
    <Grid item xs={6} sm={4}>
      <Paper variant="outlined" square={false} sx={{ padding: "0.8em" }}>
        <div style={{ fontSize: "14px", color: "#71718s" }}>{title}</div>
        <div
          style={{
            fontSize: "24px",
            color: colour === "blue" ? "#013366" : "#42814A",
            fontWeight: "bold",
          }}
        >
          {value}
        </div>
        <div style={{ fontSize: "14px", color: "#71718s" }}>{unit}</div>
      </Paper>
    </Grid>
  );
};

const Product: React.FC<{ product: any }> = ({ product }) => {
  const updatedProduct = {
    ...product,
    annual_production: `${product.annual_production} ${product.unit}`,
  };

  const fields = Object.entries(updatedProduct)
    .filter(excludeFromEntries(["name", "unit"]))
    // Filtering out the partial year data if the value wasn't provided
    .filter((f) => f[0] !== "jan_mar_production" || !!f[1])
    .filter((f) => f[0] !== "apr_dec_production" || !!f[1])
    .sort(byLabel(["reduction_factor", "tightening_rate"]));

  return (
    <>
      <h4 style={regularHeaderStyle}>{updatedProduct.name}</h4>
      {renderFieldList(fields, "default")}
    </>
  );
};

interface Props {
  data: Record<string, any>;
}

export const ComplianceSummary: React.FC<Props> = ({ data }) => {
  return (
    <FinalReviewCard title="Compliance Summary">
      <Grid container spacing={1}>
        <ComplianceValue
          title="Emissions attributable for reporting"
          value={data.emissions_attributable_for_reporting}
        />
        <ComplianceValue
          title="Reporting-only emissions"
          value={data.reporting_only_emissions}
        />
        <ComplianceValue title="Emissions limit" value={data.emissions_limit} />
        <ComplianceValue
          title="Emissions attributable for compliance"
          value={data.emissions_attributable_for_compliance}
        />
        <ComplianceValue
          title="Excess Emissions"
          value={data.excess_emissions}
        />
        <ComplianceValue
          title="Credited Emissions"
          value={data.credited_emissions}
          colour={data.credited_emissions > 0 ? "green" : "blue"}
        />
      </Grid>

      <h4 style={regularHeaderStyle}>Regulatory Values</h4>
      {renderFieldList(Object.entries(data.regulatory_values || {}), "default")}

      {data.products.map((product: any, index: number) => (
        <Product key={`product-${index}`} product={product} />
      ))}
    </FinalReviewCard>
  );
};
