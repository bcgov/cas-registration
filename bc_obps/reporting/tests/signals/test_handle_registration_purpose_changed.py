import pytest
from datetime import datetime, timezone as dt_timezone
from unittest.mock import patch, MagicMock
from model_bakery import baker

from reporting.models import ReportVersion
from reporting.signals.consumers import handle_registration_purpose_changed

pytestmark = pytest.mark.django_db


class TestHandleRegistrationPurposeChanged:
    """
    Tests for handle_registration_purpose_changed signal consumer.

    The consumer deletes the current-year draft report version for an operation
    when its registration purpose changes.

    It skips deletion if:
    - No draft report version exists
    - The draft is for a past reporting year
    - The draft belongs to a previous operator (operation was transferred)

    """

    def _make_draft_version(self, year_value: int, same_operator: bool = True):
        """
        Helper that creates a draft ReportVersion.
        same_operator=False simulates a transferred operation (report.operator != operation.operator).
        """
        operator = baker.make_recipe("registration.tests.utils.operator")
        operation = baker.make_recipe("registration.tests.utils.operation", operator=operator)
        year_obj = baker.make_recipe("reporting.tests.utils.reporting_year", reporting_year=year_value)
        report_operator = operator if same_operator else baker.make_recipe("registration.tests.utils.operator")
        report = baker.make(
            "reporting.Report",
            operation=operation,
            operator=report_operator,
            reporting_year=year_obj,
        )
        return baker.make(
            "reporting.ReportVersion",
            report=report,
            status=ReportVersion.ReportVersionStatus.Draft,
        )

    def _send(self, operation_id):
        handle_registration_purpose_changed(sender=object, operation_id=operation_id)

    def test_no_operation_id_logs_warning_and_returns(self, caplog):
        import logging

        with caplog.at_level(logging.WARNING, logger="reporting.signals.consumers"):
            handle_registration_purpose_changed(sender=object)

        assert "without operation_id" in caplog.text

    def test_no_draft_version_does_nothing(self):
        operation = baker.make_recipe("registration.tests.utils.operation")

        with patch("reporting.signals.consumers.ReportVersionService.delete_report_version") as mock_delete:
            self._send(operation.id)

        mock_delete.assert_not_called()

    @patch("reporting.signals.consumers.timezone.now")
    @patch("reporting.signals.consumers.ReportVersionService.delete_report_version")
    def test_past_year_draft_is_not_deleted(self, mock_delete: MagicMock, mock_now: MagicMock):
        mock_now.return_value = datetime(2029, 6, 1, tzinfo=dt_timezone.utc)
        draft_version = self._make_draft_version(year_value=2028)

        self._send(draft_version.report.operation_id)

        mock_delete.assert_not_called()
        assert ReportVersion.objects.filter(id=draft_version.id).exists()

    @patch("reporting.signals.consumers.timezone.now")
    @patch("reporting.signals.consumers.ReportVersionService.delete_report_version")
    def test_transferred_operation_draft_is_not_deleted(self, mock_delete: MagicMock, mock_now: MagicMock):
        mock_now.return_value = datetime(2030, 6, 1, tzinfo=dt_timezone.utc)
        draft_version = self._make_draft_version(year_value=2030, same_operator=False)

        self._send(draft_version.report.operation_id)

        mock_delete.assert_not_called()
        assert ReportVersion.objects.filter(id=draft_version.id).exists()

    @patch("reporting.signals.consumers.timezone.now")
    @patch("reporting.signals.consumers.ReportVersionService.delete_report_version")
    def test_current_year_draft_is_deleted(self, mock_delete: MagicMock, mock_now: MagicMock):
        mock_now.return_value = datetime(2031, 6, 1, tzinfo=dt_timezone.utc)
        draft_version = self._make_draft_version(year_value=2031, same_operator=True)

        self._send(draft_version.report.operation_id)

        mock_delete.assert_called_once_with(draft_version.id)

    @patch("reporting.signals.consumers.timezone.now")
    @patch("reporting.signals.consumers.ReportVersionService.delete_report_version")
    def test_submitted_version_is_not_deleted(self, mock_delete: MagicMock, mock_now: MagicMock):
        mock_now.return_value = datetime(2032, 6, 1, tzinfo=dt_timezone.utc)
        operator = baker.make_recipe("registration.tests.utils.operator")
        operation = baker.make_recipe("registration.tests.utils.operation", operator=operator)
        year_obj = baker.make_recipe("reporting.tests.utils.reporting_year", reporting_year=2032)
        report = baker.make("reporting.Report", operation=operation, operator=operator, reporting_year=year_obj)
        baker.make("reporting.ReportVersion", report=report, status=ReportVersion.ReportVersionStatus.Submitted)

        self._send(operation.id)

        mock_delete.assert_not_called()
