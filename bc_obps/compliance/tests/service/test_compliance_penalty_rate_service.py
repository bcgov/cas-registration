from compliance.service.compliance_penalty_rate_service import CompliancePenaltyRateService
import pytest

pytestmark = pytest.mark.django_db


class TestCompliancePenaltyRateService:

    def test_get_current_compliance_penalty_rate(self):
        current_rate = CompliancePenaltyRateService.get_current_compliance_penalty_rate()
        assert current_rate.is_current_rate
