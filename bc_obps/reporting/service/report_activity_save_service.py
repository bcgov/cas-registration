import uuid
from django.db import transaction
from registration.models.activity import Activity
from reporting.models.activity_json_schema import ActivityJsonSchema
from reporting.models.activity_source_type_json_schema import (
    ActivitySourceTypeJsonSchema,
)
from reporting.models.facility_report import FacilityReport
from reporting.models.fuel_type import FuelType
from reporting.models.gas_type import GasType
from reporting.models.methodology import Methodology
from reporting.models.report_activity import ReportActivity
from reporting.models.report_emission import ReportEmission
from reporting.models.report_methodology import ReportMethodology
from reporting.models.report_fuel import ReportFuel
from reporting.models.report_source_type import ReportSourceType
from reporting.models.report_unit import ReportUnit
from reporting.models.source_type import SourceType
from reporting.service.utils import exclude_keys, retrieve_ids
from reporting.service.emission_category_mapping_service import (
    EmissionCategoryMappingService,
)
from reporting.models.report_raw_activity_data import ReportRawActivityData
from decimal import Decimal


class ReportActivitySaveService:
    """
    Service that handles a json objects coming from an activity form:
    - Saves raw json data in
    - Splits out json data in, and saves individual parts into a ReportActivity object and its ReportSourceType, ReportUnit, ReportFuel and ReportEmission dependencies.
    - Removes existing data in the report if not part of the newly saved data

    usage:
    service = ReportActivitySaveLoadService(report_version_id, facility_id, activity_id)
    service.save(json_data)

    """

    facility_report: FacilityReport
    activity: Activity
    user_guid: uuid.UUID

    def __init__(
        self,
        report_version_id: int,
        facility_id: uuid.UUID,
        activity_id: int,
        user_guid: uuid.UUID,
    ):
        self.user_guid = user_guid
        self.activity = Activity.objects.get(pk=activity_id)
        self.facility_report = FacilityReport.objects.select_related("report_version", "report_version__report").get(
            report_version_id=report_version_id, facility_id=facility_id
        )

    @transaction.atomic()
    def save(self, data: dict) -> ReportActivity:
        # Excluding the keys that are not part of the json_data
        activity_data = exclude_keys(data, ["sourceTypes", "id"])

        # Save raw json data
        self.save_raw_data(data)

        # Only one ReportActivity record per report_version/faciltiy/activity should ever exist
        report_activity, _ = ReportActivity.objects.update_or_create(
            id=data.get("id"),
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

        # Delete the existing report_source_types with an id not in the form_data (this means they've been deleted on the form)
        ReportSourceType.objects.filter(report_activity=report_activity).exclude(
            id__in=retrieve_ids(data["sourceTypes"])
        ).delete()

        for source_type_key in data["sourceTypes"]:
            self.save_source_type(report_activity, source_type_key, data["sourceTypes"][source_type_key])

        return report_activity

    def save_source_type(
        self,
        report_activity: ReportActivity,
        source_type_slug: str,
        source_type_data: dict,
    ) -> ReportSourceType:
        source_type = SourceType.objects.get(json_key=source_type_slug)
        json_data = exclude_keys(source_type_data, ["units", "fuels", "emissions", "id"])

        json_base_schema = ActivitySourceTypeJsonSchema.objects.get(
            activity=report_activity.activity,
            source_type=source_type,
            valid_from__valid_from__lte=self.facility_report.report_version.report.created_at,
            valid_to__valid_to__gte=self.facility_report.report_version.report.created_at,
        )

        if json_base_schema.has_unit and "units" not in source_type_data:
            raise ValueError(f"Source type {source_type_slug} is expecting unit data")
        elif not json_base_schema.has_unit and json_base_schema.has_fuel and "fuels" not in source_type_data:
            raise ValueError(f"Source type {source_type_slug} is expecting fuel data")
        elif not json_base_schema.has_unit and not json_base_schema.has_fuel and "emissions" not in source_type_data:
            raise ValueError(f"Source type {source_type_slug} is expecting emission data")

        report_source_type, _ = ReportSourceType.objects.update_or_create(
            id=source_type_data.get("id"),
            report_version=self.facility_report.report_version,
            report_activity=report_activity,
            source_type=source_type,
            create_defaults={
                "json_data": json_data,
                "activity_source_type_base_schema": json_base_schema,
            },
            defaults={"json_data": json_data},
        )
        report_source_type.set_create_or_update(self.user_guid)

        if json_base_schema.has_unit:
            ReportUnit.objects.filter(report_source_type=report_source_type).exclude(
                id__in=retrieve_ids(source_type_data["units"])
            ).delete()

            for unit_data in source_type_data["units"]:
                self.save_unit(report_source_type, unit_data)
        elif json_base_schema.has_fuel:
            ReportFuel.objects.filter(report_source_type=report_source_type).exclude(
                id__in=retrieve_ids(source_type_data["fuels"])
            ).delete()

            for fuel_data in source_type_data["fuels"]:
                self.save_fuel(report_source_type, None, fuel_data)
        else:
            ReportEmission.objects.filter(report_source_type=report_source_type).exclude(
                id__in=retrieve_ids(source_type_data["emissions"])
            ).delete()

            for emission_data in source_type_data["emissions"]:
                self.save_emission(report_source_type, None, None, emission_data)

        return report_source_type

    def save_unit(self, report_source_type: ReportSourceType, unit_data: dict) -> ReportUnit:
        """
        ReportUnit records are not keyed, we rely on the 'id' presence to know if we update a record or create a new one
        """
        json_data = exclude_keys(unit_data, ["fuels", "emissions", "id", "type"])
        report_unit_id = unit_data.get("id", None)
        report_unit_type = unit_data.get("type", ReportUnit.ReportUnitType.UNIT)

        if report_source_type.activity_source_type_base_schema.has_fuel and "fuels" not in unit_data:
            raise ValueError("Unit is expecting fuel data")
        elif not report_source_type.activity_source_type_base_schema.has_fuel and "emissions" not in unit_data:
            raise ValueError("Unit is expecting emissions data")

        # Update record if id was provided, create otherwise
        report_unit, _ = ReportUnit.objects.update_or_create(
            id=report_unit_id,
            create_defaults={
                "json_data": json_data,
                "report_source_type": report_source_type,
                "report_version": self.facility_report.report_version,
                "type": report_unit_type,
            },
            defaults={
                "json_data": json_data,
                "type": report_unit_type,
            },
        )
        report_unit.set_create_or_update(self.user_guid)

        if report_source_type.activity_source_type_base_schema.has_fuel:
            ReportFuel.objects.filter(report_source_type=report_source_type, report_unit=report_unit).exclude(
                id__in=retrieve_ids(unit_data["fuels"])
            ).delete()

            for fuel_data in unit_data["fuels"]:
                self.save_fuel(report_source_type, report_unit, fuel_data)
        else:
            ReportEmission.objects.filter(report_source_type=report_source_type, report_unit=report_unit).exclude(
                id__in=retrieve_ids(unit_data["emissions"])
            ).delete()

            for emissions_data in unit_data["emissions"]:
                self.save_emission(report_source_type, report_unit, None, emissions_data)

        return report_unit

    def save_fuel(
        self,
        report_source_type: ReportSourceType,
        report_unit: ReportUnit | None,
        fuel_data: dict,
    ) -> ReportFuel:
        json_data = exclude_keys(fuel_data, ["emissions", "fuelType", "id"])

        report_fuel_id = fuel_data.get("id", None)
        fuel_type = FuelType.objects.get(name=fuel_data["fuelType"]["fuelName"])

        if "emissions" not in fuel_data:
            raise ValueError("Fuel is expecting emission data")

        report_fuel, _ = ReportFuel.objects.update_or_create(
            id=report_fuel_id,
            create_defaults={
                "json_data": json_data,
                "report_source_type": report_source_type,
                "report_version": self.facility_report.report_version,
                "fuel_type": fuel_type,
                # Only add the report_unit key if report_unit is not None
                **({"report_unit": report_unit} if report_unit else {}),
            },
            defaults={"json_data": json_data, "fuel_type": fuel_type},
        )
        report_fuel.set_create_or_update(self.user_guid)

        ReportEmission.objects.filter(report_source_type=report_source_type, report_fuel=report_fuel).exclude(
            id__in=retrieve_ids(fuel_data["emissions"])
        ).delete()

        for emission_data in fuel_data["emissions"]:
            self.save_emission(report_source_type, None, report_fuel, emission_data)

        return report_fuel

    def save_emission(
        self,
        report_source_type: ReportSourceType,
        report_unit: ReportUnit | None,
        report_fuel: ReportFuel | None,
        emission_data: dict,
    ) -> ReportEmission:
        json_data = exclude_keys(emission_data, ["gasType", "id", "methodology"])
        gas_type = GasType.objects.get(chemical_formula=emission_data["gasType"])
        # Set equivalent emission value (emission * gwp)
        equivalent_emission = round(Decimal(json_data["emission"]) * gas_type.gwp, 4)
        json_data["equivalentEmission"] = str(equivalent_emission)

        report_emission_id = emission_data.get("id")
        if "methodology" not in emission_data:
            raise ValueError("Emission is expecting methodology data")

        report_emission, _ = ReportEmission.objects.update_or_create(
            id=report_emission_id,
            create_defaults={
                "json_data": json_data,
                "report_source_type": report_source_type,
                "report_version": self.facility_report.report_version,
                "gas_type": gas_type,
                **({"report_fuel": report_fuel} if report_fuel else {}),
                **({"report_unit": report_unit} if report_unit else {}),
            },
            defaults={"json_data": json_data, "gas_type": gas_type},
        )
        report_emission.set_create_or_update(self.user_guid)
        EmissionCategoryMappingService.apply_emission_categories(report_source_type, report_fuel, report_emission)

        self.save_methodology(report_emission, emission_data["methodology"])

        return report_emission

    def save_methodology(
        self,
        report_emission: ReportEmission,
        methodology_data: dict,
    ) -> ReportMethodology:
        json_data = exclude_keys(methodology_data, ["methodology", "id"])
        methodology = Methodology.objects.get(name=methodology_data["methodology"])

        report_methodology_id = methodology_data.get("id")
        report_methodology, _ = ReportMethodology.objects.update_or_create(
            id=report_methodology_id,
            create_defaults={
                "methodology": methodology,
                "json_data": json_data,
                "report_version": self.facility_report.report_version,
                "report_emission": report_emission,
            },
            defaults={"json_data": json_data, "methodology": methodology},
        )
        report_methodology.set_create_or_update(self.user_guid)

        return report_methodology

    def save_raw_data(self, data: dict) -> ReportRawActivityData:
        """
        Save the raw activity data before processing.

        Args:
            data (dict): The raw JSON data to save

        Returns:
            ReportRawActivityData: The saved raw activity data object
        """
        report_raw_activity, _ = ReportRawActivityData.objects.update_or_create(
            facility_report=self.facility_report,
            activity=self.activity,
            defaults={"json_data": data},
        )
        report_raw_activity.set_create_or_update(self.user_guid)

        return report_raw_activity
