from decimal import Decimal

from django.test import SimpleTestCase
from reporting.schema.compliance_data import ComplianceDataSchemaOut, ComplianceSummaryDataSchemaOut
from reporting.service.compliance_service.compliance_service import ComplianceData, ReportProductComplianceData
from reporting.service.compliance_service.eafc_totals import EafcEmissionRow, EafcTotals
from reporting.service.compliance_service.parameters import ProductionPeriod
from reporting.service.compliance_service.regulatory_values import RegulatoryValues


def build_compliance_data() -> ComplianceData:
    return ComplianceData(
        emissions_attributable_for_reporting=Decimal("100"),
        reporting_only_emissions=Decimal("100.01"),
        emissions_attributable_for_compliance=Decimal("100.02"),
        emissions_limit=Decimal("100.03"),
        excess_emissions=Decimal("100.04"),
        credited_emissions=Decimal("100.05"),
        industry_regulatory_values=RegulatoryValues(
            compliance_period=2000,
            initial_compliance_period=1867,
            reduction_factor=Decimal("2.34"),
            tightening_rate=Decimal("5.55"),
        ),
        products=[
            ReportProductComplianceData(
                name="product 1",
                unit="production unit",
                product_id=999,
                annual_production=Decimal("1"),
                jan_mar_production=Decimal("0.2"),
                apr_dec_production=Decimal("0.5"),
                emission_intensity=Decimal("2.3"),
                allocated_industrial_process_emissions=Decimal("123.45"),
                allocated_compliance_emissions=Decimal("567.89"),
                reduction_factor_override=None,
                tightening_rate_override=None,
                allocated_for_compliance_annual=Decimal("567.89"),
            ),
            ReportProductComplianceData(
                name="product 2",
                unit="production unit",
                product_id=992,
                annual_production=Decimal("5"),
                jan_mar_production=Decimal("1"),
                apr_dec_production=Decimal("4"),
                emission_intensity=Decimal("3"),
                allocated_industrial_process_emissions=Decimal("2"),
                allocated_compliance_emissions=Decimal("1"),
                reduction_factor_override=Decimal("0.001"),
                tightening_rate_override=Decimal("99999.99"),
                allocated_for_compliance_annual=Decimal("1"),
            ),
        ],
        production_period=ProductionPeriod.ANNUAL,
        is_new_entrant=False,
        eafc_totals=EafcTotals(
            attributable_for_reporting=Decimal("100"),
            excluded_by_fuels=Decimal("0"),
            non_useful_venting=Decimal("0"),
            fugitive=Decimal("0"),
            remaining_npnc=Decimal("0.01"),
            allocated_to_unregulated_products=Decimal("0"),
            annual_eafc=Decimal("99.99"),
            attributable_for_reporting_rows=[
                EafcEmissionRow(
                    activity="Oil and gas", source_type="Flaring stacks", fuel_name=None, emissions=Decimal("100")
                )
            ],
            remaining_npnc_rows=[
                EafcEmissionRow(
                    activity="GSC", source_type="GSC of fuel", fuel_name="Diesel", emissions=Decimal("0.01")
                )
            ],
        ),
    )


class TestComplianceDataSchema(SimpleTestCase):

    def test_translates_without_errors(self):
        data = build_compliance_data()

        schema_under_test = ComplianceDataSchemaOut.from_orm(data)

        self.assertAlmostEqual(schema_under_test.emissions_attributable_for_reporting, 100)
        self.assertAlmostEqual(schema_under_test.reporting_only_emissions, 100.01)
        self.assertAlmostEqual(schema_under_test.emissions_attributable_for_compliance, 100.02)
        self.assertAlmostEqual(schema_under_test.emissions_limit, 100.03)
        self.assertAlmostEqual(schema_under_test.excess_emissions, 100.04)
        self.assertAlmostEqual(schema_under_test.credited_emissions, 100.05)

        assert dict(schema_under_test.regulatory_values) == {
            "compliance_period": 2000,
            "initial_compliance_period": 1867,
        }
        assert dict(schema_under_test.products[0]) == {
            "name": "product 1",
            "annual_production": 1.0,
            "jan_mar_production": 0.2,
            "apr_dec_production": 0.5,
            "emission_intensity": 2.3,
            "allocated_industrial_process_emissions": 123.45,
            "allocated_compliance_emissions": 567.89,
            "reduction_factor": 2.34,  # Defaulting to industry values
            "tightening_rate": 5.55,  # Defaulting to industry values
            "unit": "production unit",
        }
        assert dict(schema_under_test.products[1]) == {
            "name": "product 2",
            "unit": "production unit",
            "annual_production": 5.0,
            "jan_mar_production": 1.0,
            "apr_dec_production": 4.0,
            "emission_intensity": 3.0,
            "allocated_industrial_process_emissions": 2.0,
            "allocated_compliance_emissions": 1.0,
            "reduction_factor": 0.001,  # Use overridden value
            "tightening_rate": 99999.99,  # Use overridden value
        }

        # Breakdown fields belong to the Compliance Summary schema only (Final Review uses this one)
        dumped = schema_under_test.model_dump()
        assert "eafc_totals" not in dumped
        assert "production_period" not in dumped
        assert "is_new_entrant" not in dumped
        assert "allocated_for_compliance_annual" not in dumped["products"][0]

    def test_compliance_summary_schema_adds_breakdown_fields(self):
        data = build_compliance_data()

        schema_under_test = ComplianceSummaryDataSchemaOut.model_validate(data, from_attributes=True)
        dumped = schema_under_test.model_dump()

        assert dumped["production_period"] == "annual"
        assert dumped["is_new_entrant"] is False
        assert dumped["eafc_totals"] == {
            "attributable_for_reporting": 100.0,
            "excluded_by_fuels": 0.0,
            "non_useful_venting": 0.0,
            "fugitive": 0.0,
            "remaining_npnc": 0.01,
            "allocated_to_unregulated_products": 0.0,
            "annual_eafc": 99.99,
            "attributable_for_reporting_rows": [
                {"activity": "Oil and gas", "source_type": "Flaring stacks", "fuel_name": None, "emissions": 100.0}
            ],
            "excluded_by_fuels_rows": [],
            "non_useful_venting_rows": [],
            "fugitive_rows": [],
            "remaining_npnc_rows": [
                {"activity": "GSC", "source_type": "GSC of fuel", "fuel_name": "Diesel", "emissions": 0.01}
            ],
            "unregulated_product_rows": [],
        }
        assert dumped["products"][0]["allocated_for_compliance_annual"] == 567.89
        assert dumped["products"][1]["allocated_for_compliance_annual"] == 1.0
        # Overrides are still resolved the same way as the base schema
        assert dumped["products"][1]["reduction_factor"] == 0.001
