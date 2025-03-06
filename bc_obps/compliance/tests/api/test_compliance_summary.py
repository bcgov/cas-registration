from decimal import Decimal
import pytest
from django.test import Client
from model_bakery import baker
from compliance.models import ComplianceSummary, ComplianceObligation
from registration.tests.utils.helpers import CommonTestSetup, TestUtils
from registration.utils import custom_reverse_lazy
from registration.models.bc_greenhouse_gas_id import BcGreenhouseGasId


class TestComplianceSummaryEndpoint(CommonTestSetup):
    def setup_method(self):
        super().setup_method()
        self.endpoint_url = "/api/compliance/summaries"
    
    def test_get_compliance_summaries_unauthorized(self):
        # Act
        response = Client().get(self.endpoint_url)

        # Assert
        assert response.status_code == 401