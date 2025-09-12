from model_bakery import baker
from compliance.service.compliance_charge_rate_service import ComplianceChargeRateService
import pytest
from decimal import Decimal

pytestmark = pytest.mark.django_db


class TestComplianceChargeRateService:
    def test_get_rate_for_year_success(self):
        # Arrange
        reporting_year = baker.make_recipe("reporting.tests.utils.reporting_year", reporting_year=2050)
        baker.make_recipe(
            "compliance.tests.utils.compliance_charge_rate",
            reporting_year=reporting_year,
            rate=Decimal("50.00"),
        )
        # Act
        result = ComplianceChargeRateService.get_rate_for_year(reporting_year)
        # Assert
        assert result == Decimal('50.00')
