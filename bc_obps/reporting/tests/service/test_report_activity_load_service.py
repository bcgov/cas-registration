from unittest.mock import patch
import uuid
import pytest
from unittest.mock import MagicMock
from model_bakery.baker import make_recipe
from reporting.models.report_activity import ReportActivity
from reporting.service.report_activity_load_service import ReportActivityLoadService


@pytest.mark.django_db
class TestReportActivityLoadService:
    @patch("reporting.service.report_activity_serializers.ReportActivitySerializer.serialize")
    def test_serializes_the_right_object(self, mock_serializer: MagicMock):
        mock_serializer.return_value = {"successful test": True}

        report_version = make_recipe("reporting.tests.utils.report_version")
        report_activity = make_recipe(
            "reporting.tests.utils.report_activity",
            report_version=report_version,
            facility_report__report_version=report_version,
        )

        serialized = ReportActivityLoadService.load(
            report_version.id, report_activity.facility_report.facility_id, report_activity.activity_id
        )

        assert serialized == {"successful test": True}
        mock_serializer.assert_called_once_with(ReportActivity.objects.get(id=report_activity.id))

    def test_returns_empty_dict_if_no_report_activity_record_exists_yet(self):

        serialized = ReportActivityLoadService.load(1000, uuid.UUID(int=0), 1000)

        assert serialized == {}
