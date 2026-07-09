from compliance.service.compliance_penalty_rate_service import CompliancePenaltyRateService
import pytest
from datetime import date
from model_bakery import baker

pytestmark = pytest.mark.django_db


class TestCompliancePenaltyRateService:
    def setup_method(self):
        self.compliance_penalty_rate = baker.make_recipe(
            "compliance.tests.utils.compliance_penalty_rate",
            rate="0.0038",
            is_current_rate=True,
        )

    def test_get_current_compliance_penalty_rate(self):
        compliance_period_1 = baker.make_recipe(
            "compliance.tests.utils.compliance_period",
            start_date=date(2022, 1, 1),
            end_date=date(2022, 12, 31),
        )
        compliance_period_2 = baker.make_recipe(
            "compliance.tests.utils.compliance_period",
            start_date=date(2027, 1, 1),
            end_date=date(2027, 12, 31),
        )
        baker.make_recipe(
            "compliance.tests.utils.compliance_penalty_rate",
            compliance_period=compliance_period_1,
            rate="0.0023",
            is_current_rate=False,
        )
        baker.make_recipe(
            "compliance.tests.utils.compliance_penalty_rate",
            compliance_period=compliance_period_2,
            rate="0.0055",
            is_current_rate=False,
        )

        current_rate = CompliancePenaltyRateService.get_current_compliance_penalty_rate()
        assert current_rate == self.compliance_penalty_rate
