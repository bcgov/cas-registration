from unittest.mock import MagicMock, patch
from django.test import TestCase
from django.core.exceptions import ValidationError
import pytest
from reporting.models.report_activity import ReportActivity
from reporting.models.report_source_type import ReportSourceType
from reporting.service.report_activity_save_service import ReportActivitySaveService
from reporting.tests.service.test_report_activity_save_service.infrastructure import TestInfrastructure
from model_bakery.baker import make


class TestSaveReportActivity(TestCase):
    @patch("reporting.service.report_activity_save_service.ReportActivitySaveService.save_source_type")
    def test_save_activity(self, mock_save_source_type: MagicMock):
        test_infrastructure = TestInfrastructure.build()
        activity_data = {
            "stuff": "testing",
            "number": 1234,
            "sourceTypes": {"testSourceType": {"stuff": True}},
        }

        service_under_test = ReportActivitySaveService(
            test_infrastructure.facility_report.report_version.id,
            test_infrastructure.facility_report.facility.id,
            test_infrastructure.activity_json_schema.activity.id,
            test_infrastructure.user.user_guid,
        )

        # Create case
        assert (
            ReportActivity.objects.filter(
                facility_report=test_infrastructure.facility_report,
                activity=test_infrastructure.activity_json_schema.activity,
            ).count()
            == 0
        )
        return_value = service_under_test.save(activity_data)
        report_activity = ReportActivity.objects.get(
            facility_report=test_infrastructure.facility_report,
            activity=test_infrastructure.activity_json_schema.activity,
        )

        assert return_value == report_activity
        assert return_value.activity_base_schema == test_infrastructure.activity_json_schema
        assert return_value.facility_report == test_infrastructure.facility_report
        assert return_value.json_data == {"stuff": "testing", "number": 1234}
        assert return_value.report_version == test_infrastructure.facility_report.report_version

        mock_save_source_type.assert_called_with(report_activity, "testSourceType", {"stuff": True})

    @patch("reporting.service.report_activity_save_service.ReportActivitySaveService.save_source_type")
    def test_save_activity_update(self, mock_save_source_type: MagicMock):
        test_infrastructure = TestInfrastructure.build()
        activity_data = {
            "stuff": "testing",
            "number": 1234,
            "sourceTypes": {"testSourceType": {"stuff": True}},
        }
        service_under_test = ReportActivitySaveService(
            test_infrastructure.facility_report.report_version.id,
            test_infrastructure.facility_report.facility.id,
            test_infrastructure.activity_json_schema.activity.id,
            test_infrastructure.user.user_guid,
        )
        report_activity = service_under_test.save(activity_data)

        # Update
        # If no ID is provided, an error is expected
        with pytest.raises(ValidationError):
            service_under_test.save({"sourceTypes": {"anotherSourceType": {"more_stuff": True}}})

        # If the ID of the ReportActivity object doesn't match, an error is expected
        with pytest.raises(ValidationError):
            service_under_test.save(
                {"id": report_activity.id + 1, "sourceTypes": {"anotherSourceType": {"more_stuff": True}}}
            )

        updated_activity_data = {
            "id": report_activity.id,
            "stuff": "testing updated",
            "number": 123456,
            "extra_boolean": True,
            "sourceTypes": {"anotherSourceType": {"more_stuff": True}},
        }

        service_under_test.save(updated_activity_data)
        report_activity.refresh_from_db()

        assert report_activity.id == updated_activity_data["id"]
        assert report_activity.activity_base_schema == test_infrastructure.activity_json_schema
        assert report_activity.facility_report == test_infrastructure.facility_report
        assert report_activity.json_data == {"stuff": "testing updated", "number": 123456, "extra_boolean": True}
        assert report_activity.report_version == test_infrastructure.facility_report.report_version

        mock_save_source_type.assert_called_with(report_activity, "anotherSourceType", {"more_stuff": True})

    @patch("reporting.service.report_activity_save_service.ReportActivitySaveService.save_source_type")
    def test_removes_deleted_source_types(self, mock_save_source_type: MagicMock):
        test_infrastructure = TestInfrastructure.build()
        activity_data = {
            "stuff": "testing",
            "number": 1234,
            "sourceTypes": {"testSourceType": {"stuff": True}},
        }
        service_under_test = ReportActivitySaveService(
            test_infrastructure.report_version.id,
            test_infrastructure.facility_report.facility.id,
            test_infrastructure.activity_json_schema.activity.id,
            test_infrastructure.user.user_guid,
        )
        report_activity = service_under_test.save(activity_data)

        act_st_1 = test_infrastructure.make_activity_source_type(
            source_type__json_key="existingSourceType1", has_unit=True, has_fuel=True
        )
        act_st_2 = test_infrastructure.make_activity_source_type(
            source_type__json_key="existingSourceType2", has_unit=True, has_fuel=True
        )
        act_st_3 = test_infrastructure.make_activity_source_type(
            source_type__json_key="existingSourceType3", has_unit=True, has_fuel=True
        )

        make(
            ReportSourceType,
            activity_source_type_base_schema=act_st_1,
            source_type=act_st_1.source_type,
            report_activity=report_activity,
            report_version=test_infrastructure.report_version,
            json_data={"test1": 1},
        )
        report_source_type_2 = make(
            ReportSourceType,
            activity_source_type_base_schema=act_st_2,
            source_type=act_st_2.source_type,
            report_activity=report_activity,
            report_version=test_infrastructure.report_version,
            json_data={"test2": 2},
        )
        make(
            ReportSourceType,
            activity_source_type_base_schema=act_st_3,
            source_type=act_st_3.source_type,
            report_activity=report_activity,
            report_version=test_infrastructure.report_version,
            json_data={"test3": 3},
        )

        assert ReportSourceType.objects.filter(report_activity=report_activity).count() == 3
        assert list(
            ReportSourceType.objects.filter(report_activity=report_activity)
            .order_by("id")
            .values_list("source_type__json_key", flat=True)
        ) == ["existingSourceType1", "existingSourceType2", "existingSourceType3"]

        updated_activity_data = {
            "id": report_activity.id,
            "stuff": "testing",
            "number": 1234,
            "sourceTypes": {"existingSourceType2": {"id": report_source_type_2.id, "stuff": True}},
        }

        mock_save_source_type.reset_mock()
        service_under_test.save(updated_activity_data)

        # The report_source_type 1 and 3 are not present with an ID in the payload and should have been deleted
        assert ReportSourceType.objects.filter(report_activity=report_activity).count() == 1
        assert list(
            ReportSourceType.objects.filter(report_activity=report_activity).values_list(
                "source_type__json_key", flat=True
            )
        ) == ["existingSourceType2"]

        mock_save_source_type.assert_called_once_with(
            report_activity, "existingSourceType2", {"id": report_source_type_2.id, "stuff": True}
        )
