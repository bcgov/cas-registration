from django.db import transaction
from typing import Optional
import copy
from reporting.models import (
    FacilityReport,
    ReportActivity,
    ReportAdditionalData,
    ReportAttachment,
    ReportEmission,
    ReportFuel,
    ReportMethodology,
    ReportNewEntrant,
    ReportNewEntrantEmission,
    ReportNewEntrantProduction,
    ReportNonAttributableEmissions,
    ReportOperation,
    ReportOperationRepresentative,
    ReportPersonResponsible,
    ReportProduct,
    ReportProductEmissionAllocation,
    ReportRawActivityData,
    ReportSourceType,
    ReportUnit,
    ReportVerification,
    ReportVersion,
)


class ReportSupplementaryVersionService:
    @staticmethod
    @transaction.atomic
    def create_report_supplementary_version(report_version_id: int) -> ReportVersion:
        """
        Creates a new report version for a given report version ID cloning related data.

        Args:
            report_version_id: The report version ID

        Returns:
            New ReportVersion instance
        """
        # Get the existing report version
        report_version = ReportVersion.objects.get(id=report_version_id)
        # Create a new report version as a Draft
        new_report_version = ReportVersion.objects.create(
            report=report_version.report,
            report_type=report_version.report_type,
            status=ReportVersion.ReportVersionStatus.Draft,
            is_latest_submitted=False,
        )
        # Clone related data
        ReportSupplementaryVersionService.clone_report_version_operation(report_version, new_report_version)
        ReportSupplementaryVersionService.clone_report_version_representatives(report_version, new_report_version)
        ReportSupplementaryVersionService.clone_report_version_person_responsible(report_version, new_report_version)
        ReportSupplementaryVersionService.clone_report_version_additional_data(report_version, new_report_version)
        ReportSupplementaryVersionService.clone_report_version_new_entrant_data(report_version, new_report_version)
        ReportSupplementaryVersionService.clone_report_version_verification(report_version, new_report_version)
        ReportSupplementaryVersionService.clone_report_version_attachments(report_version, new_report_version)
        ReportSupplementaryVersionService.clone_report_version_facilities(report_version, new_report_version)
        # Return the newly created report version
        return new_report_version

    @staticmethod
    def clone_report_version_operation(old_report_version: ReportVersion, new_report_version: ReportVersion) -> None:
        # Retrieve the original operation from the old report version
        report_version_operation_to_clone = ReportOperation.objects.get(report_version=old_report_version)

        # Store the many-to-many relationships before cloning
        original_activities = list(report_version_operation_to_clone.activities.all())
        original_regulated_products = list(report_version_operation_to_clone.regulated_products.all())

        # Clone the operation by resetting the primary key and assigning the new report version
        report_version_operation_to_clone.id = None
        report_version_operation_to_clone.report_version = new_report_version
        report_version_operation_to_clone.save()

        # Reassign the many-to-many relationships to the new cloned operation
        report_version_operation_to_clone.activities.set(original_activities)
        report_version_operation_to_clone.regulated_products.set(original_regulated_products)

    @staticmethod
    def clone_report_version_representatives(
        old_report_version: ReportVersion, new_report_version: ReportVersion
    ) -> None:
        # Retrieve all ReportOperationRepresentative instances associated with the old report version
        representatives_to_clone = ReportOperationRepresentative.objects.filter(report_version=old_report_version)

        # Clone each representative instance for the new report version
        for representative_to_clone in representatives_to_clone:
            representative_to_clone.pk = None  # Reset primary key to create a new instance
            representative_to_clone.report_version = new_report_version
            representative_to_clone.save()

    @staticmethod
    def clone_report_version_person_responsible(
        old_report_version: ReportVersion, new_report_version: ReportVersion
    ) -> None:
        # Retrieve the ReportPersonResponsible instance associated with the old report version
        report_person_responsible_to_clone = ReportPersonResponsible.objects.filter(
            report_version=old_report_version
        ).first()

        if report_person_responsible_to_clone:
            # Clone the instance by resetting the primary key and updating the report version
            report_person_responsible_to_clone.pk = None
            report_person_responsible_to_clone.report_version = new_report_version
            report_person_responsible_to_clone.save()

    @staticmethod
    def clone_report_version_additional_data(
        old_report_version: ReportVersion, new_report_version: ReportVersion
    ) -> None:
        # Retrieve the ReportAdditionalData instance associated with the old report version
        report_additional_data_to_clone = ReportAdditionalData.objects.filter(report_version=old_report_version).first()

        if report_additional_data_to_clone:
            # Clone the instance by resetting the primary key and updating the report version
            report_additional_data_to_clone.pk = None
            report_additional_data_to_clone.report_version = new_report_version
            report_additional_data_to_clone.save()

    @staticmethod
    def clone_report_version_new_entrant_data(
        old_report_version: ReportVersion, new_report_version: ReportVersion
    ) -> None:
        # Retrieve the ReportNewEntrant instance associated with the old report version
        report_new_entrant_to_clone = ReportNewEntrant.objects.filter(report_version=old_report_version).first()
        if not report_new_entrant_to_clone:
            return

        # Retrieve associated ReportNewEntrantEmission and ReportNewEntrantProduction data from the old instance
        old_emissions = list(ReportNewEntrantEmission.objects.filter(report_new_entrant=report_new_entrant_to_clone))
        old_productions = list(
            ReportNewEntrantProduction.objects.filter(report_new_entrant=report_new_entrant_to_clone)
        )

        # Clone the ReportNewEntrant instance by resetting the primary key and updating the report version
        report_new_entrant_to_clone.pk = None
        report_new_entrant_to_clone.report_version = new_report_version
        report_new_entrant_to_clone.save()

        # Clone the associated ReportNewEntrantEmission data
        emissions_to_create = [
            ReportNewEntrantEmission(
                report_new_entrant=report_new_entrant_to_clone,
                emission_category=emission.emission_category,
                emission=emission.emission,
            )
            for emission in old_emissions
        ]
        ReportNewEntrantEmission.objects.bulk_create(emissions_to_create)

        # Clone the associated ReportNewEntrantProduction data
        productions_to_create = [
            ReportNewEntrantProduction(
                report_new_entrant=report_new_entrant_to_clone,
                product=production.product,
                production_amount=production.production_amount,
            )
            for production in old_productions
        ]
        ReportNewEntrantProduction.objects.bulk_create(productions_to_create)

    @staticmethod
    def clone_report_version_verification(old_report_version: ReportVersion, new_report_version: ReportVersion) -> None:
        # Retrieve the ReportVerification instance associated with the old report version
        verification_to_clone = ReportVerification.objects.filter(report_version=old_report_version).first()
        if not verification_to_clone:
            return

        # Store the associated ReportVerificationVisit instances
        old_visits = list(verification_to_clone.report_verification_visits.all())

        # Clone the ReportVerification instance by resetting the primary key and updating the report version
        verification_to_clone.pk = None
        verification_to_clone.report_version = new_report_version
        verification_to_clone.save()

        # Clone each associated ReportVerificationVisit for the new verification
        for visit in old_visits:
            visit.pk = None
            visit.report_verification = verification_to_clone
            visit.save()

    @staticmethod
    def clone_report_version_attachments(old_report_version: ReportVersion, new_report_version: ReportVersion) -> None:
        # Retrieve all ReportAttachment instances associated with the old report version
        old_attachments = ReportAttachment.objects.filter(report_version_id=old_report_version)
        # Clone each attachment for the new report version
        for attachment in old_attachments:
            attachment.pk = None
            attachment.report_version = new_report_version
            attachment.save()

    @staticmethod
    def clone_report_version_facilities(old_report_version: ReportVersion, new_report_version: ReportVersion) -> None:
        # Retrieve all FacilityReport instances associated with the old report version.
        facility_reports_to_clone = FacilityReport.objects.filter(report_version=old_report_version)
        for facility_report_to_clone in facility_reports_to_clone:
            # Use a deep copy so that the original instance (with its relationships) is preserved.
            cloned_facility_report = copy.deepcopy(facility_report_to_clone)
            cloned_facility_report.pk = None  # Reset the primary key.
            cloned_facility_report.report_version = new_report_version  # Set the new report version.
            cloned_facility_report.is_completed = False
            cloned_facility_report.save()

            ReportSupplementaryVersionService.clone_report_version_facility_activities(
                facility_report_to_clone, cloned_facility_report
            )
            ReportSupplementaryVersionService.clone_report_version_facility_non_attributable_emissions(
                old_report_version, new_report_version, facility_report_to_clone, cloned_facility_report
            )
            ReportSupplementaryVersionService.clone_report_version_facility_product_data(
                old_report_version, new_report_version, facility_report_to_clone, cloned_facility_report
            )

    @staticmethod
    def clone_report_version_facility_activities(
        old_facility_report: FacilityReport, new_facility_report: FacilityReport
    ) -> None:
        # Retrieve and clone each ReportActivity for the new facility report.
        cloned_activities = [
            ReportSupplementaryVersionService.clone_report_version_facility_activity(old_activity, new_facility_report)
            for old_activity in ReportActivity.objects.filter(facility_report=old_facility_report)
        ]
        # Update the many-to-many relationship on the new facility report
        new_facility_report.activities.set([activity.activity for activity in cloned_activities])

    @staticmethod
    def clone_report_version_facility_activity(
        old_activity_to_clone: ReportActivity, new_facility_report: FacilityReport
    ) -> ReportActivity:
        # Create a deep copy of the old activity so that the original remains unchanged.
        cloned_activity = copy.deepcopy(old_activity_to_clone)
        # Reset the primary key so that Django creates a new record.
        cloned_activity.pk = None
        # Update the foreign keys to point to the new report and facility.
        cloned_activity.report_version = new_facility_report.report_version
        cloned_activity.facility_report = new_facility_report
        cloned_activity.save()

        # Clone the related ReportRawActivityData record for the activity
        ReportSupplementaryVersionService.clone_activity_raw_json_data(old_activity_to_clone, new_facility_report)

        # Clone each related ReportSourceType associated with the old activity
        for old_source_type_to_clone in ReportSourceType.objects.filter(report_activity=old_activity_to_clone):
            ReportSupplementaryVersionService.clone_activity_source_type(old_source_type_to_clone, cloned_activity)

        return cloned_activity

    @staticmethod
    def clone_activity_raw_json_data(
        old_activity_to_clone: ReportActivity, new_facility_report: FacilityReport
    ) -> None:
        try:
            old_raw_data = ReportRawActivityData.objects.get(
                facility_report=old_activity_to_clone.facility_report,
                activity=old_activity_to_clone.activity,
            )
        except ReportRawActivityData.DoesNotExist:
            return

        cloned_raw_data = copy.deepcopy(old_raw_data)
        cloned_raw_data.pk = None  # Reset the primary key so a new record is created.
        cloned_raw_data.facility_report = new_facility_report  # Update the relationship to the new facility report.
        cloned_raw_data.save()

    @staticmethod
    def clone_activity_source_type(old_source_type_to_clone: ReportSourceType, new_activity: ReportActivity) -> None:
        # Clone ReportSourceType using a deep copy.
        cloned_source_type = copy.deepcopy(old_source_type_to_clone)
        cloned_source_type.pk = None
        cloned_source_type.report_version = new_activity.report_version
        cloned_source_type.report_activity = new_activity
        cloned_source_type.save()

        # Clone additional related data based on the schema.
        if old_source_type_to_clone.activity_source_type_base_schema.has_unit:
            ReportSupplementaryVersionService.clone_source_type_units(old_source_type_to_clone, cloned_source_type)
        elif old_source_type_to_clone.activity_source_type_base_schema.has_fuel:
            ReportSupplementaryVersionService.clone_source_type_fuels(old_source_type_to_clone, cloned_source_type)
        else:
            ReportSupplementaryVersionService.clone_source_type_emissions(old_source_type_to_clone, cloned_source_type)

    @staticmethod
    def clone_source_type_units(old_source_type_to_clone: ReportSourceType, new_source_type: ReportSourceType) -> None:
        # Clone each ReportUnit related to the source type.
        old_units_to_clone = ReportUnit.objects.filter(report_source_type=old_source_type_to_clone)
        for old_unit_to_clone in old_units_to_clone:
            cloned_unit = copy.deepcopy(old_unit_to_clone)
            cloned_unit.pk = None
            cloned_unit.report_version = new_source_type.report_version
            cloned_unit.report_source_type = new_source_type
            cloned_unit.save()

            if old_source_type_to_clone.activity_source_type_base_schema.has_fuel:
                ReportSupplementaryVersionService.clone_unit_fuels(
                    old_source_type_to_clone, new_source_type, old_unit_to_clone, cloned_unit
                )
            else:
                ReportSupplementaryVersionService.clone_unit_emissions(
                    old_source_type_to_clone, new_source_type, old_unit_to_clone, cloned_unit
                )

    @staticmethod
    def clone_source_type_fuels(old_source_type_to_clone: ReportSourceType, new_source_type: ReportSourceType) -> None:
        # Clone ReportFuel instances that are directly related to the source type (with no associated unit).
        old_fuels_to_clone = ReportFuel.objects.filter(
            report_source_type=old_source_type_to_clone, report_unit__isnull=True
        )
        for old_fuel_to_clone in old_fuels_to_clone:
            cloned_fuel = copy.deepcopy(old_fuel_to_clone)
            cloned_fuel.pk = None
            cloned_fuel.report_version = new_source_type.report_version
            cloned_fuel.report_source_type = new_source_type
            cloned_fuel.save()
            ReportSupplementaryVersionService.clone_fuel_emissions(
                old_source_type_to_clone, new_source_type, old_fuel_to_clone, cloned_fuel
            )

    @staticmethod
    def clone_unit_fuels(
        old_source_type_to_clone: ReportSourceType,
        new_source_type: ReportSourceType,
        old_unit_to_clone: ReportUnit,
        new_unit: ReportUnit,
    ) -> None:
        # Clone ReportFuel instances associated with the given unit.
        old_fuels_to_clone = ReportFuel.objects.filter(
            report_source_type=old_source_type_to_clone, report_unit=old_unit_to_clone
        )
        for old_fuel_to_clone in old_fuels_to_clone:
            cloned_fuel = copy.deepcopy(old_fuel_to_clone)
            cloned_fuel.pk = None
            cloned_fuel.report_version = new_source_type.report_version
            cloned_fuel.report_source_type = new_source_type
            cloned_fuel.report_unit = new_unit
            cloned_fuel.save()
            ReportSupplementaryVersionService.clone_fuel_emissions(
                old_source_type_to_clone, new_source_type, old_fuel_to_clone, cloned_fuel, new_unit
            )

    @staticmethod
    def _clone_emission_common_fields(
        old_emission_to_clone: ReportEmission,
        report_version: ReportVersion,
        new_source_type: ReportSourceType,
        new_unit: Optional[ReportUnit] = None,
        new_fuel: Optional[ReportFuel] = None,
    ) -> None:
        # Clone a ReportEmission instance using deep copy.
        cloned_emission = copy.deepcopy(old_emission_to_clone)
        cloned_emission.pk = None
        cloned_emission.report_version = report_version
        cloned_emission.report_source_type = new_source_type
        cloned_emission.report_unit = new_unit
        cloned_emission.report_fuel = new_fuel
        cloned_emission.save()

        # Clone the many-to-many emission categories.
        cloned_emission.emission_categories.set(old_emission_to_clone.emission_categories.all())

        # Clone related methodology.
        ReportSupplementaryVersionService.clone_emission_methodology(old_emission_to_clone, cloned_emission)

    @staticmethod
    def clone_source_type_emissions(
        old_source_type_to_clone: ReportSourceType, new_source_type: ReportSourceType
    ) -> None:
        # Clone ReportEmission instances that have no unit and no fuel.
        old_emissions_to_clone = ReportEmission.objects.filter(
            report_source_type=old_source_type_to_clone, report_unit__isnull=True, report_fuel__isnull=True
        )
        for old_emission_to_clone in old_emissions_to_clone:
            ReportSupplementaryVersionService._clone_emission_common_fields(
                old_emission_to_clone,
                report_version=new_source_type.report_version,
                new_source_type=new_source_type,
            )

    @staticmethod
    def clone_unit_emissions(
        old_source_type_to_clone: ReportSourceType,
        new_source_type: ReportSourceType,
        old_unit_to_clone: ReportUnit,
        new_unit: ReportUnit,
    ) -> None:
        # Clone ReportEmission instances associated with a unit (and no fuel).
        old_emissions_to_clone = ReportEmission.objects.filter(
            report_source_type=old_source_type_to_clone, report_unit=old_unit_to_clone, report_fuel__isnull=True
        )
        for old_emission_to_clone in old_emissions_to_clone:
            ReportSupplementaryVersionService._clone_emission_common_fields(
                old_emission_to_clone,
                report_version=new_source_type.report_version,
                new_source_type=new_source_type,
                new_unit=new_unit,
            )

    @staticmethod
    def clone_fuel_emissions(
        old_source_type_to_clone: ReportSourceType,
        new_source_type: ReportSourceType,
        old_fuel_to_clone: ReportFuel,
        new_fuel: ReportFuel,
        new_unit: Optional[ReportUnit] = None,
    ) -> None:
        # Clone ReportEmission instances associated with a fuel.
        old_emissions_to_clone = ReportEmission.objects.filter(
            report_source_type=old_source_type_to_clone, report_fuel=old_fuel_to_clone
        )
        for old_emission_to_clone in old_emissions_to_clone:
            ReportSupplementaryVersionService._clone_emission_common_fields(
                old_emission_to_clone,
                report_version=new_source_type.report_version,
                new_source_type=new_source_type,
                new_fuel=new_fuel,
                new_unit=new_unit if old_emission_to_clone.report_unit else None,
            )

    @staticmethod
    def clone_emission_methodology(old_emission_to_clone: ReportEmission, new_emission: ReportEmission) -> None:
        # Clone each ReportMethodology related to the old emission.
        old_methodologies_to_clone = ReportMethodology.objects.filter(report_emission=old_emission_to_clone)
        for old_methodology_to_clone in old_methodologies_to_clone:
            cloned_methodology = copy.deepcopy(old_methodology_to_clone)
            cloned_methodology.pk = None
            cloned_methodology.report_version = new_emission.report_version
            cloned_methodology.report_emission = new_emission
            cloned_methodology.save()

    @staticmethod
    def clone_report_version_facility_non_attributable_emissions(
        old_report_version: ReportVersion,
        new_report_version: ReportVersion,
        old_facility_report_to_clone: FacilityReport,
        new_facility_report: FacilityReport,
    ) -> None:
        # Retrieve non-attributable emissions for the old facility report.
        old_emissions_to_clone = ReportNonAttributableEmissions.objects.filter(
            report_version=old_report_version, facility_report=old_facility_report_to_clone
        )
        for old_emission_to_clone in old_emissions_to_clone:
            cloned_emission = copy.deepcopy(old_emission_to_clone)
            cloned_emission.pk = None
            cloned_emission.report_version = new_report_version
            cloned_emission.facility_report = new_facility_report
            cloned_emission.save()
            # Preserve the many-to-many gas type relationship.
            cloned_emission.gas_type.set(old_emission_to_clone.gas_type.all())

    @staticmethod
    def clone_report_version_facility_product_data(
        old_report_version: ReportVersion,
        new_report_version: ReportVersion,
        old_facility_report_to_clone: FacilityReport,
        new_facility_report: FacilityReport,
    ) -> None:
        # Retrieve ReportProduct entries for the old facility report.
        old_report_products_to_clone = ReportProduct.objects.filter(
            report_version=old_report_version, facility_report=old_facility_report_to_clone
        )
        for old_report_product_to_clone in old_report_products_to_clone:
            cloned_report_product = copy.deepcopy(old_report_product_to_clone)
            cloned_report_product.pk = None
            cloned_report_product.report_version = new_report_version
            cloned_report_product.facility_report = new_facility_report
            cloned_report_product.save()
            ReportSupplementaryVersionService.clone_report_version_facility_product_emission_allocations(
                old_report_version=old_report_version,
                new_report_version=new_report_version,
                old_facility_report=old_facility_report_to_clone,
                new_facility_report=new_facility_report,
                old_report_product_to_clone=old_report_product_to_clone,
                new_report_product=cloned_report_product,
            )

    @staticmethod
    def clone_report_version_facility_product_emission_allocations(
        old_report_version: ReportVersion,
        new_report_version: ReportVersion,
        old_facility_report: FacilityReport,
        new_facility_report: FacilityReport,
        old_report_product_to_clone: ReportProduct,
        new_report_product: ReportProduct,
    ) -> None:
        # Retrieve ReportProductEmissionAllocation entries for the old report product.
        old_allocations_to_clone = ReportProductEmissionAllocation.objects.filter(
            report_version=old_report_version,
            facility_report=old_facility_report,
            report_product=old_report_product_to_clone,
        )
        for old_allocation_to_clone in old_allocations_to_clone:
            cloned_allocation = copy.deepcopy(old_allocation_to_clone)
            cloned_allocation.pk = None
            cloned_allocation.report_version = new_report_version
            cloned_allocation.facility_report = new_facility_report
            cloned_allocation.report_product = new_report_product
            cloned_allocation.save()