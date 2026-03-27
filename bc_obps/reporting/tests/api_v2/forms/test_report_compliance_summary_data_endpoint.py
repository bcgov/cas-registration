from unittest.mock import MagicMock, patch
from uuid import uuid4

from model_bakery.baker import make_recipe

from registration.tests.utils.helpers import CommonTestSetup, TestUtils
from registration.utils import custom_reverse_lazy
from reporting.tests.utils.report_access_validation import (
    assert_report_version_ownership_is_validated,
)


class TestComplianceSummaryFormV2Endpoints(CommonTestSetup):
    def setup_method(self):
        self.report_version = make_recipe(
            "reporting.tests.utils.report_version",
            report__reporting_year__reporting_year=2222,
        )
        self.route_name = "get_compliance_summary_form_data"

        super().setup_method()

    def _url(self, version_id=None):
        return custom_reverse_lazy(
            self.route_name,
            kwargs={"version_id": version_id or self.report_version.id},
        )

    @patch("reporting.api_v2.forms.report_compliance_summary_data.FormResponseBuilder")
    @patch("reporting.api_v2.forms.report_compliance_summary_data.ComplianceDataSchemaOut.from_orm")
    @patch(
        "reporting.api_v2.forms.report_compliance_summary_data.FacilityReportService.get_facility_report_by_version_id"
    )
    @patch("reporting.api_v2.forms.report_compliance_summary_data.ComplianceService.get_calculated_compliance_data")
    def test_authorized_user_can_get_compliance_summary(
        self,
        mock_get_calculated_compliance_data: MagicMock,
        mock_get_facility_report_by_version_id: MagicMock,
        mock_from_orm: MagicMock,
        mock_form_response_builder: MagicMock,
    ):
        TestUtils.authorize_current_user_as_operator_user(
            self,
            operator=self.report_version.report.operator,
        )

        facility_id = str(uuid4())

        mock_compliance_data = MagicMock()
        mock_get_calculated_compliance_data.return_value = mock_compliance_data
        mock_get_facility_report_by_version_id.return_value = facility_id

        payload_dict = {
            "emissions_attributable_for_reporting": 11000.0,
            "reporting_only_emissions": 100.0,
            "emissions_attributable_for_compliance": 10900.0,
            "emissions_limit": 463.488,
            "excess_emissions": 10436.512,
            "credited_emissions": 0.0,
            "regulatory_values": {
                "initial_compliance_period": 2024,
                "compliance_period": 2025,
            },
            "products": [
                {
                    "name": "Cement equivalent",
                    "annual_production": 5000.0,
                    "jan_mar_production": 1200.0,
                    "apr_dec_production": 3800.0,
                    "emission_intensity": 0.345,
                    "allocated_industrial_process_emissions": 50.0,
                    "allocated_compliance_emissions": 450.0,
                    "reduction_factor": 0.95,
                    "tightening_rate": 0.01,
                }
            ],
        }
        mock_from_orm.return_value.dict.return_value = payload_dict

        mock_builder = MagicMock()
        mock_form_response_builder.return_value = mock_builder
        mock_builder.operation_data.return_value = mock_builder
        mock_builder.facility_data.return_value = mock_builder
        mock_builder.payload.return_value = mock_builder

        expected_response = {
            "report_data": {
                "report_version_id": self.report_version.id,
                "reporting_year": 2222,
            },
            "facility_data": {
                "facility_id": facility_id,
                "facility_type": "SFO",
                "facility_name": "Bravo Facility",
            },
            "operation_data": {
                "naics_code": "123456",
                "operation_type": "Operation Type",
            },
            "payload": payload_dict,
        }
        mock_builder.build.return_value = expected_response

        response = TestUtils.mock_get_with_auth_role(
            self,
            "industry_user",
            self._url(),
        )

        assert response.status_code == 200, response.json()

        mock_get_calculated_compliance_data.assert_called_once_with(self.report_version.id)
        mock_get_facility_report_by_version_id.assert_called_once_with(self.report_version.id)
        mock_from_orm.assert_called_once_with(mock_compliance_data)

        mock_form_response_builder.assert_called_once_with(self.report_version.id)
        mock_builder.operation_data.assert_called_once_with()
        mock_builder.facility_data.assert_called_once_with(facility_id)
        mock_builder.payload.assert_called_once_with(payload_dict)
        mock_builder.build.assert_called_once_with()

        assert response.json() == expected_response

    def test_validates_report_version_id(self):
        assert_report_version_ownership_is_validated(self.route_name)
