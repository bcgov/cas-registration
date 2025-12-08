from unittest.mock import patch
from django.http import HttpRequest
from django.test import SimpleTestCase
from reporting.api_v2._reports._report_id.history import ReportHistoryResponseBuilder


class TestReportHistoryResponseBuilder(SimpleTestCase):
    @patch("reporting.api_v2._reports._report_id.report_information_mixin.Report")
    @patch("reporting.models.report_version.ReportVersion")
    def test_with_payload(self, MockReportVersion, MockReport):
        mocked_report = MockReport.objects.select_related.return_value.get.return_value
        mocked_report.reporting_year_id = 2023
        mocked_report.operation.name = "Another Operation"

        # Mock queryset of ReportVersion objects
        mock_rv1 = MockReportVersion()
        mock_rv1.id = 1
        mock_rv1.status = "complete"
        mock_rv2 = MockReportVersion()
        mock_rv2.id = 2
        mock_rv2.status = "pending"
        mocked_qs = [mock_rv1, mock_rv2]

        builder = ReportHistoryResponseBuilder(HttpRequest())
        result = builder.report(456).payload(mocked_qs).build()
        assert result["report_data"] == {"reporting_year": 2023, "operation_name": "Another Operation"}
        # The payload should be the list of mocked ReportVersion objects
        assert result["payload"] == {'count': 2, 'items': mocked_qs}

    @patch("reporting.api_v2._reports._report_id.report_information_mixin.Report")
    @patch("reporting.models.report_version.ReportVersion")
    def test_chaining_report_and_payload_order_independence(self, MockReportVersion, MockReport):
        mocked_report = MockReport.objects.select_related.return_value.get.return_value
        mocked_report.reporting_year_id = 2024
        mocked_report.operation.name = "Chain Operation"

        # Mock queryset of ReportVersion objects
        mock_rv1 = MockReportVersion()
        mock_rv1.id = 3
        mock_rv1.status = "Draft"
        mock_rv2 = MockReportVersion()
        mock_rv2.id = 4
        mock_rv2.status = "Submitted"
        mocked_qs = [mock_rv1, mock_rv2]

        builder = ReportHistoryResponseBuilder(HttpRequest())

        # Chaining order shouldn't matter
        result1 = builder.report(789).payload(mocked_qs).build()
        builder2 = ReportHistoryResponseBuilder(HttpRequest())
        result2 = builder2.payload(mocked_qs).report(789).build()

        expected = {
            "report_data": {"reporting_year": 2024, "operation_name": "Chain Operation"},
            "payload": {'count': 2, 'items': mocked_qs},
        }
        assert result1 == expected
        assert result2 == expected
