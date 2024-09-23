import json
import uuid
from django.db import transaction
from registration.models.activity import Activity
from reporting.models.activity_json_schema import ActivityJsonSchema
from reporting.models.activity_source_type_json_schema import ActivitySourceTypeJsonSchema
from reporting.models.facility_report import FacilityReport
from reporting.models.report_activity import ReportActivity
from reporting.models.report_source_type import ReportSourceType
from reporting.models.report_unit import ReportUnit
from reporting.models.source_type import SourceType
from reporting.service.utils import exclude_keys


class ReportActivitySaveLoadService:
    """
    Service that handles a json objects coming from an activity form:
    - Splits out json data in, and saves individual parts into a ReportActivity object
    - With a report_version, a facility and an activity, fetches the report_activity and all its dependent data and returns json data for the form

    usage:
    service = ReportActivitySaveLoadService(report_version_id, facility_id, activity_id)
    service.save(json_data)

    service.load()
    """

    facility_report: FacilityReport
    activity: Activity
    user_guid: uuid.UUID

    def __init__(self, report_version_id: int, facility_id: uuid.UUID, activity_id: int, user_guid: uuid.UUID):
        self.user_guid = user_guid
        self.activity = Activity.objects.get(pk=activity_id)
        self.facility_report = FacilityReport.objects.select_related('report_version', 'report_version__report').get(
            report_version_id=report_version_id, facility_id=facility_id
        )

    @transaction.atomic()
    def save(self, data: dict) -> ReportActivity:
        print("~~~~~~~~~~~~~~~~~~~~~~")
        print(json.dumps(data, indent=4))
        print("~~~~~~~~~~~~~~~~~~~~~~")

        # All data except the 'source_type' key
        activity_data = exclude_keys(data, ['sourceTypes', 'id'])

        print("activity data:", activity_data)

        # Only one ReportActivity record per report_version/faciltiy/activity should ever exist

        report_activity, _ = ReportActivity.objects.update_or_create(
            report_version=self.facility_report.report_version,
            facility_report=self.facility_report,
            activity=self.activity,
            create_defaults={
                "json_data": activity_data,
                "activity_base_schema": ActivityJsonSchema.objects.get(
                    activity=self.activity,
                    valid_from__valid_from__lte=self.facility_report.report_version.report.created_at,
                    valid_to__valid_to__gte=self.facility_report.report_version.report.created_at,
                ),
            },
            defaults={"json_data": activity_data},
        )
        report_activity.set_create_or_update(self.user_guid)

        for source_type_key in data['sourceTypes']:
            self.save_source_type(report_activity, source_type_key, data["sourceTypes"][source_type_key])

        return report_activity

    def save_source_type(
        self,
        report_activity: ReportActivity,
        source_type_slug: str,
        source_type_data: dict,
    ) -> ReportSourceType:
        print(f"processing st {source_type_slug}")

        source_type = SourceType.objects.get(json_key=source_type_slug)
        json_data = exclude_keys(source_type_data, ['units', 'id'])

        print("source type data:", json_data)

        json_base_schema = ActivitySourceTypeJsonSchema.objects.get(
            activity=report_activity.activity,
            source_type=source_type,
            valid_from__valid_from__lte=self.facility_report.report_version.report.created_at,
            valid_to__valid_to__gte=self.facility_report.report_version.report.created_at,
        )

        report_source_type, _ = ReportSourceType.objects.update_or_create(
            report_version=self.facility_report.report_version,
            report_activity=report_activity,
            source_type=source_type,
            create_defaults={"json_data": json_data, "activity_source_type_base_schema": json_base_schema},
            defaults={"json_data": json_data},
        )

        if json_base_schema.has_unit:
            for unit_data in source_type_data['units']:
                self.save_unit(report_source_type, unit_data)
        elif json_base_schema.has_fuel:
            # for fuel in fuels
            self.save_fuel()
        else:
            # for emission in emissions
            self.save_emission()

    def save_unit(self, report_source_type: ReportSourceType, unit_data: dict):
        """
        ReportUnit records are not keyed, we rely on the 'id' presence to know if we update a record or create a new one
        """
        json_data = exclude_keys(unit_data, ['fuels', 'id'])
        unit_id = unit_data.get('id', None)

        # Update record if id was provided, create otherwise
        report_unit, _ = ReportUnit.objects.update_or_create(
            id=unit_id,
            create_defaults={
                "json_data": json_data,
                "report_source_type": report_source_type,
                "report_version": self.facility_report.report_version,
            },
            defaults={"json_data": json_data},
        )
        # if unit_id:
        #     report_unit = ReportUnit.objects.get(id=unit_id)
        #     report_unit.json_data = json_data
        #     report_unit.save()
        # else:
        #     report_unit = ReportUnit(
        #         report_source_type=report_source_type,
        #         report_version=self.facility_report.report_version,
        #         json_data=json_data,
        #     )
        #     report_unit.save()

        report_unit.set_create_or_update(self.user_guid)

        if report_source_type.activity_source_type_base_schema.has_fuel:
            for fuel_data in unit_data['fuels']:
                self.save_fuel()

        else:
            self.save_emission()

    def save_fuel(self):
        pass

    def save_emission(self):
        pass
