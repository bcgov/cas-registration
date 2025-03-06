from django.test import Client
from registration.tests.utils.helpers import CommonTestSetup


class TestComplianceSummaryEndpoint(CommonTestSetup):
    def setup_method(self):
        super().setup_method()
        self.endpoint_url = "/api/compliance/summaries"

    def test_get_compliance_summaries_unauthorized(self):
        # Act
        response = Client().get(self.endpoint_url)

        # Assert
        assert response.status_code == 401
