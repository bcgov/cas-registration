from decimal import Decimal

from django.test import SimpleTestCase
from reporting.schema.compliance_data import ComplianceDataSchemaOut
from reporting.service.compliance_service.compliance_service import ComplianceData, ReportProductComplianceData
from reporting.service.compliance_service.regulatory_values import RegulatoryValues


class TestComplianceDataSchema(SimpleTestCase):

    def test_translates_without_errors(self):

        data = ComplianceData(
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
                    product_id=999,
                    annual_production=Decimal("1"),
                    jan_mar_production=Decimal("0.25"),
                    apr_dec_production=Decimal("0.5"),
                    emission_intensity=Decimal("2.3"),
                    allocated_industrial_process_emissions=Decimal("123.45"),
                    allocated_compliance_emissions=Decimal("567.89"),
                    reduction_factor_override=None,
                    tightening_rate_override=None,
                ),
                ReportProductComplianceData(
                    name="product 2",
                    product_id=992,
                    annual_production=Decimal("5"),
                    jan_mar_production=Decimal("0"),
                    apr_dec_production=Decimal("4"),
                    emission_intensity=Decimal("3"),
                    allocated_industrial_process_emissions=Decimal("2"),
                    allocated_compliance_emissions=Decimal("1"),
                    reduction_factor_override=Decimal("0.001"),
                    tightening_rate_override=Decimal("99999.99"),
                ),
            ],
            reporting_year=2345,
        )

        schema_under_test = ComplianceDataSchemaOut.from_orm(data)

        self.assertAlmostEqual(schema_under_test.emissions_attributable_for_reporting, 100)
        self.assertAlmostEqual(schema_under_test.reporting_only_emissions, 100.01)
        self.assertAlmostEqual(schema_under_test.emissions_attributable_for_compliance, 100.02)
        self.assertAlmostEqual(schema_under_test.emissions_limit, 100.03)
        self.assertAlmostEqual(schema_under_test.excess_emissions, 100.04)
        self.assertAlmostEqual(schema_under_test.credited_emissions, 100.05)
        self.assertAlmostEqual(schema_under_test.reporting_year, 2345)

        assert dict(schema_under_test.regulatory_values) == {
            "compliance_period": 2000,
            "initial_compliance_period": 1867,
        }
        assert dict(schema_under_test.products[0]) == {
            "name": "product 1",
            "annual_production": 1,
            "apr_dec_production": 0.5,
            "emission_intensity": 2.3,
            "allocated_industrial_process_emissions": 123.45,
            "allocated_compliance_emissions": 567.89,
            "reduction_factor": 2.34,  # Defaulting to industry values
            "tightening_rate": 5.55,  # Defaulting to industry values
        }
        assert dict(schema_under_test.products[1]) == {
            "name": "product 2",
            "annual_production": 5,
            "apr_dec_production": 4,
            "emission_intensity": 3,
            "allocated_industrial_process_emissions": 2,
            "allocated_compliance_emissions": 1,
            "reduction_factor": 0.001,  # Use overridden value
            "tightening_rate": 99999.99,  # Use overridden value
        }
