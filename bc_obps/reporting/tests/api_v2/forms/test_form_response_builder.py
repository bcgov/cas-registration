from uuid import UUID
from unittest.mock import patch

from django.test import SimpleTestCase

from reporting.api_v2.forms.form_response_builder import FormResponseBuilder


TEST_FACILITY_ID = UUID("12345678-1234-5678-1234-567812345678")


class TestFormResponseBuilder(SimpleTestCase):
    @patch("reporting.api_v2.forms.form_response_builder.ReportVersion")
    def test_constructor(self, mock_report_version):
        mocked_report_version = mock_report_version.objects.select_related.return_value.get.return_value
        mocked_report_version.report.reporting_year_id = 2021
        mocked_report_version.id = 99

        builder = FormResponseBuilder(123)

        assert builder.build() == {"report_data": {"reporting_year": 2021, "report_version_id": 99}}

    @patch("reporting.api_v2.forms.form_response_builder.FacilityReport")
    @patch("reporting.api_v2.forms.form_response_builder.ReportVersion")
    def test_with_facility_data(self, mock_report_version, mock_facility_report):
        mocked_report_version = mock_report_version.objects.select_related.return_value.get.return_value
        mocked_report_version.report.reporting_year_id = 1999
        mocked_report_version.id = 100

        mocked_facility_report = mock_facility_report.objects.get.return_value
        mocked_facility_report.facility_type = "Facility Of Unusual Size"
        mocked_facility_report.facility_name = "Name!!"

        builder = FormResponseBuilder(456)
        assert builder.facility_data(TEST_FACILITY_ID).build() == {
            "report_data": {"reporting_year": 1999, "report_version_id": 100},
            "facility_data": {
                "facility_id": TEST_FACILITY_ID,
                "facility_type": "Facility Of Unusual Size",
                "facility_name": "Name!!",
            },
        }

    @patch("reporting.api_v2.forms.form_response_builder.ReportOperationOptOutService")
    @patch("reporting.api_v2.forms.form_response_builder.NaicsCodeService")
    @patch("reporting.api_v2.forms.form_response_builder.ReportOperation")
    @patch("reporting.api_v2.forms.form_response_builder.ReportVersion")
    def test_with_operation_data(
        self, mock_report_version, mock_report_operation, mock_naics_code_service, mock_report_operation_opt_out
    ):
        mocked_report_version = mock_report_version.objects.select_related.return_value.get.return_value
        mocked_report_version.report.reporting_year_id = 2001
        mocked_report_version.id = 123456789

        mock_naics_code_service.get_naics_code_by_version_id.return_value = "123456"
        mock_report_operation_opt_out.is_operation_opted_out.return_value = False

        mocked_report_operation = mock_report_operation.objects.select_related.return_value.get.return_value
        mocked_report_operation.operation_type = "test type"

        builder = FormResponseBuilder(456).operation_data()

        assert builder.build() == {
            "report_data": {"reporting_year": 2001, "report_version_id": 123456789},
            "operation_data": {
                "naics_code": "123456",
                "operation_type": "test type",
                "is_operation_opted_out": False,
            },
        }

    @patch("reporting.api_v2.forms.form_response_builder.ReportVersion")
    def test_with_payload(self, mock_report_version):
        mocked_report_version = mock_report_version.objects.select_related.return_value.get.return_value
        mocked_report_version.report.reporting_year_id = 2999
        mocked_report_version.id = 101

        builder = FormResponseBuilder(100000)

        assert builder.payload({"a": "b"}).build() == {
            "report_data": {"reporting_year": 2999, "report_version_id": 101},
            "payload": {"a": "b"},
        }

    @patch("reporting.api_v2.forms.form_response_builder.ReportOperationOptOutService")
    @patch("reporting.api_v2.forms.form_response_builder.NaicsCodeService")
    @patch("reporting.api_v2.forms.form_response_builder.FacilityReport")
    @patch("reporting.api_v2.forms.form_response_builder.ReportOperation")
    @patch("reporting.api_v2.forms.form_response_builder.ReportVersion")
    def test_with_facility_and_operation_and_payload(
        self,
        mock_report_version,
        mock_report_operation,
        mock_facility_report,
        mock_naics_code_service,
        mock_report_operation_opt_out,
    ):
        mocked_report_version = mock_report_version.objects.select_related.return_value.get.return_value
        mocked_report_version.report.reporting_year_id = 3000
        mocked_report_version.id = 102

        mocked_report_operation = mock_report_operation.objects.select_related.return_value.get.return_value
        mocked_report_operation.operation_type = "Operation Type"

        mock_naics_code_service.get_naics_code_by_version_id.return_value = "222333"
        mock_report_operation_opt_out.is_operation_opted_out.return_value = True

        mocked_facility_report = mock_facility_report.objects.get.return_value
        mocked_facility_report.facility_type = "Facility Type"
        mocked_facility_report.facility_name = "Facility Name"

        builder = FormResponseBuilder(987654)

        # Build order shouldn't matter
        assert (
            builder.payload({"c": 1}).facility_data(TEST_FACILITY_ID).operation_data().build()
            == builder.operation_data().facility_data(TEST_FACILITY_ID).payload({"c": 1}).build()
        )

        assert builder.payload({"c": 1}).facility_data(TEST_FACILITY_ID).operation_data().build() == {
            "report_data": {"reporting_year": 3000, "report_version_id": 102},
            "facility_data": {
                "facility_id": TEST_FACILITY_ID,
                "facility_type": "Facility Type",
                "facility_name": "Facility Name",
            },
            "operation_data": {
                "operation_type": "Operation Type",
                "naics_code": "222333",
                "is_operation_opted_out": True,
            },
            "payload": {"c": 1},
        }
