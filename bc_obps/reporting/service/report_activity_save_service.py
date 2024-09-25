import json
import uuid
from django.db import transaction
from registration.models.activity import Activity
from reporting.models.activity_json_schema import ActivityJsonSchema
from reporting.models.activity_source_type_json_schema import ActivitySourceTypeJsonSchema
from reporting.models.facility_report import FacilityReport
from reporting.models.report_activity import ReportActivity
from reporting.models.report_emission import ReportEmission
from reporting.models.report_fuel import ReportFuel
from reporting.models.report_source_type import ReportSourceType
from reporting.models.report_unit import ReportUnit
from reporting.models.source_type import SourceType
from reporting.service.utils import exclude_keys


class ReportActivitySaveService:
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
        print("~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~")
        print(json.dumps(data, indent=4))
        # All data except the 'source_type' key
        activity_data = exclude_keys(data, ['sourceTypes', 'id'])
        print("activity data:", json.dumps(activity_data, indent=4))

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
        source_type = SourceType.objects.get(json_key=source_type_slug)
        json_data = exclude_keys(source_type_data, ['units', 'id'])

        print("source type data:", json.dumps(json_data, indent=4))

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
        report_source_type.set_create_or_update(self.user_guid)

        if json_base_schema.has_unit:
            for unit_data in source_type_data['units']:
                self.save_unit(report_source_type, unit_data)
        elif json_base_schema.has_fuel:
            for fuel_data in source_type_data['fuels']:
                self.save_fuel(report_source_type, None, fuel_data)
        else:
            for emission_data in source_type_data['emissions']:
                self.save_emission(report_source_type, None, emission_data)

        return report_source_type

    def save_unit(self, report_source_type: ReportSourceType, unit_data: dict) -> ReportUnit:
        """
        ReportUnit records are not keyed, we rely on the 'id' presence to know if we update a record or create a new one
        """
        json_data = exclude_keys(unit_data, ['fuels', 'id'])
        report_unit_id = unit_data.get('id', None)

        # Update record if id was provided, create otherwise
        report_unit, _ = ReportUnit.objects.update_or_create(
            id=report_unit_id,
            create_defaults={
                "json_data": json_data,
                "report_source_type": report_source_type,
                "report_version": self.facility_report.report_version,
            },
            defaults={"json_data": json_data},
        )
        report_unit.set_create_or_update(self.user_guid)

        if report_source_type.activity_source_type_base_schema.has_fuel:
            for fuel_data in unit_data['fuels']:
                self.save_fuel(report_source_type, report_unit, fuel_data)
        else:
            for emission_data in json_data['emissions']:
                self.save_emission(report_source_type, None, emission_data)

        return report_unit

    def save_fuel(
        self,
        report_source_type: ReportSourceType,
        report_unit: ReportUnit | None,
        fuel_data: dict,
    ) -> ReportFuel:
        json_data = exclude_keys(fuel_data, ['emissions', 'id'])
        report_fuel_id = fuel_data.get('id', None)

        report_fuel, _ = ReportFuel.objects.update_or_create(
            id=report_fuel_id,
            create_defaults={
                "json_data": json_data,
                "report_source_type": report_source_type,
                "report_version": self.facility_report.report_version,
                # Only add the report_unit key if report_unit is not None
                **({"report_unit": report_unit} if report_unit else {}),
            },
            defaults={"json_data": json_data},
        )
        report_fuel.set_create_or_update(self.user_guid)

        for emission_data in json_data['emissions']:
            self.save_emission(report_source_type, report_fuel, emission_data)

        return report_fuel

    def save_emission(
        self,
        report_source_type: ReportSourceType,
        report_fuel: ReportFuel | None,
        emission_data: dict,
    ) -> ReportEmission:
        json_data = exclude_keys(emission_data, ['id'])
        report_emission_id = emission_data.get('id')

        report_emission, _ = ReportEmission.objects.update_or_create(
            id=report_emission_id,
            create_defaults={
                "json_data": json_data,
                "report_source_type": report_source_type,
                "report_version": self.facility_report.report_version,
                **({"report_fuel": report_fuel} if report_fuel else {}),
            },
            defaults={"json_data": json_data},
        )
        report_emission.set_create_or_update(self.user_guid)

        return report_emission
