from unittest.mock import patch
from uuid import UUID
from django.test import SimpleTestCase
from reporting.api_v2.forms.form_response_builder import FormResponseBuilder


class TestFormResponseBuilder(SimpleTestCase):
    @patch("reporting.api_v2.forms.form_response_builder.ReportVersion")
    def test_constructor(self, MockReportVersion):
        mocked_report_version = MockReportVersion.objects.select_related.return_value.get.return_value
        mocked_report_version.report.reporting_year_id = 2021
        mocked_report_version.id = 99

        builder = FormResponseBuilder(123)

        assert builder.build() == {"report_data": {"reporting_year": 2021, "report_version_id": 99}}

    @patch("reporting.api_v2.forms.form_response_builder.FacilityReport")
    @patch("reporting.api_v2.forms.form_response_builder.ReportVersion")
    def test_with_facility_data(self, MockReportVersion, MockFacilityReport):
        mocked_report_version = MockReportVersion.objects.select_related.return_value.get.return_value
        mocked_report_version.report.reporting_year_id = 1999
        mocked_report_version.id = 100

        mocked_facility_report = MockFacilityReport.objects.get.return_value
        mocked_facility_report.facility_type = "Facility Of Unusual Size"

        builder = FormResponseBuilder(456)
        assert builder.facility_data(UUID('12345678-1234-5678-1234-567812345678')).build() == {
            "report_data": {"reporting_year": 1999, "report_version_id": 100},
            "facility_data": {"facility_type": "Facility Of Unusual Size"},
        }

    @patch("reporting.api_v2.forms.form_response_builder.ReportVersion")
    def test_with_payload(self, MockReportVersion):
        mocked_report_version = MockReportVersion.objects.select_related.return_value.get.return_value
        mocked_report_version.report.reporting_year_id = 2999
        mocked_report_version.id = 101

        builder = FormResponseBuilder(100000)

        assert builder.payload({"a": "b"}).build() == {
            "report_data": {"reporting_year": 2999, "report_version_id": 101},
            "payload": {"a": "b"},
        }

    @patch("reporting.api_v2.forms.form_response_builder.FacilityReport")
    @patch("reporting.api_v2.forms.form_response_builder.ReportVersion")
    def test_with_facility_and_payload(self, MockReportVersion, MockFacilityReport):
        mocked_report_version = MockReportVersion.objects.select_related.return_value.get.return_value
        mocked_report_version.report.reporting_year_id = 3000
        mocked_report_version.id = 102

        mocked_facility_report = MockFacilityReport.objects.get.return_value
        mocked_facility_report.facility_type = "Facility Type"

        builder = FormResponseBuilder(987654)

        # Build order shouldn't matter
        assert (
            builder.payload({"c": 1}).facility_data(UUID('12345678-1234-5678-1234-567812345678')).build()
            == builder.facility_data(UUID('12345678-1234-5678-1234-567812345678')).payload({"c": 1}).build()
        )

        assert builder.payload({"c": 1}).facility_data(UUID('12345678-1234-5678-1234-567812345678')).build() == {
            "report_data": {"reporting_year": 3000, "report_version_id": 102},
            "facility_data": {"facility_type": "Facility Type"},
            "payload": {"c": 1},
        }
