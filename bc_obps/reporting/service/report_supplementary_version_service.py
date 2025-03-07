from django.db import transaction
from reporting.models.facility_report import FacilityReport
from reporting.models.report_operation import ReportOperation
from reporting.models.report_version import ReportVersion
from reporting.models import ReportOperationRepresentative
from reporting.models import ReportPersonResponsible
from reporting.models import (
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
    ReportProduct,
    ReportProductEmissionAllocation,
    ReportSourceType,
    ReportUnit,
    ReportVerification,
    ReportVerificationVisit,
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
        ReportSupplementaryVersionService.clone_report_version_person_responsible(
            report_version, new_report_version
        )
        ReportSupplementaryVersionService.clone_report_version_additional_data(report_version, new_report_version)
        ReportSupplementaryVersionService.clone_report_version_new_entrant_data(report_version, new_report_version)
        ReportSupplementaryVersionService.clone_report_version_verification(report_version, new_report_version)
        ReportSupplementaryVersionService.clone_report_version_attachments(report_version, new_report_version)
        ReportSupplementaryVersionService.clone_report_version_facilities(report_version, new_report_version)
        # Return the newly created report version
        return new_report_version

    @staticmethod
    def clone_report_version_operation(old_report_version: ReportVersion, new_report_version: ReportVersion) -> None:
        # Get the old ReportOperation associated with the old report version
        old_report_version_operation = ReportOperation.objects.get(report_version=old_report_version)
        # Clone the ReportOperation for the new report version
        new_report_version_operation = ReportOperation.objects.create(
            operator_legal_name=old_report_version_operation.operator_legal_name,
            operator_trade_name=old_report_version_operation.operator_trade_name,
            operation_name=old_report_version_operation.operation_name,
            operation_type=old_report_version_operation.operation_type,
            registration_purpose=old_report_version_operation.registration_purpose,
            operation_bcghgid=old_report_version_operation.operation_bcghgid,
            bc_obps_regulated_operation_id=old_report_version_operation.bc_obps_regulated_operation_id,
            report_version=new_report_version,
        )
        # Clone the related activities and regulated products to the new ReportOperation
        new_report_version_operation.activities.set(old_report_version_operation.activities.all())
        new_report_version_operation.regulated_products.set(old_report_version_operation.regulated_products.all())

    @staticmethod
    def clone_report_version_representatives(
        old_report_version: ReportVersion, new_report_version: ReportVersion
    ) -> None:
        # Get all ReportOperationRepresentatives associated with the old report version
        representatives = ReportOperationRepresentative.objects.filter(report_version=old_report_version)
        # Clone the ReportOperationRepresentatives for the new report version
        for old_rep in representatives:
            ReportOperationRepresentative.objects.create(
                report_version=new_report_version,
                representative_name=old_rep.representative_name,
                selected_for_report=old_rep.selected_for_report,
            )

    @staticmethod
    def clone_report_version_person_responsible(
        old_report_version: ReportVersion, new_report_version: ReportVersion
    ) -> None:
        # Get the ReportPersonResponsible associated with the old report version
        old_report_version_person_responsible = ReportPersonResponsible.objects.filter(
            report_version=old_report_version
        ).first()
        if old_report_version_person_responsible:
            # Clone the ReportPersonResponsible for the new report version
            ReportPersonResponsible.objects.create(
                report_version=new_report_version,
                first_name=old_report_version_person_responsible.first_name,
                last_name=old_report_version_person_responsible.last_name,
                email=old_report_version_person_responsible.email,
                phone_number=old_report_version_person_responsible.phone_number,
                position_title=old_report_version_person_responsible.position_title,
                business_role=old_report_version_person_responsible.business_role,
                street_address=old_report_version_person_responsible.street_address,
                municipality=old_report_version_person_responsible.municipality,
                province=old_report_version_person_responsible.province,
                postal_code=old_report_version_person_responsible.postal_code,
            )

    @staticmethod
    def clone_report_version_additional_data(
        old_report_version: ReportVersion, new_report_version: ReportVersion
    ) -> None:
        # Get the ReportAdditionalData associated with the old report version
        old_report_version_additional_data = ReportAdditionalData.objects.filter(
            report_version=old_report_version
        ).first()
        if old_report_version_additional_data:
            # Clone the ReportAdditionalData for the new report version
            ReportAdditionalData.objects.create(
                report_version=new_report_version,
                capture_emissions=old_report_version_additional_data.capture_emissions,
                emissions_on_site_use=old_report_version_additional_data.emissions_on_site_use,
                emissions_on_site_sequestration=old_report_version_additional_data.emissions_on_site_sequestration,
                emissions_off_site_transfer=old_report_version_additional_data.emissions_off_site_transfer,
                electricity_generated=old_report_version_additional_data.electricity_generated,
            )

    @staticmethod
    @transaction.atomic
    def clone_report_version_new_entrant_data(
        old_report_version: ReportVersion, new_report_version: ReportVersion
    ) -> None:
        # Get the ReportNewEntrant associated with the old report version
        old_report_version_new_entrant = ReportNewEntrant.objects.filter(report_version_id=old_report_version).first()
        if not old_report_version_new_entrant:
            return None
        # Clone the ReportNewEntrant for the new report version
        new_report_version_new_entrant = ReportNewEntrant.objects.create(
            report_version=new_report_version,
            authorization_date=old_report_version_new_entrant.authorization_date,
            first_shipment_date=old_report_version_new_entrant.first_shipment_date,
            new_entrant_period_start=old_report_version_new_entrant.new_entrant_period_start,
            assertion_statement=old_report_version_new_entrant.assertion_statement,
        )
        # Clone the associated ReportNewEntrantEmission data
        old_emissions = ReportNewEntrantEmission.objects.filter(report_new_entrant=old_report_version_new_entrant)
        emissions_to_create = [
            ReportNewEntrantEmission(
                report_new_entrant=new_report_version_new_entrant,
                emission_category=emission.emission_category,
                emission=emission.emission,
            )
            for emission in old_emissions
        ]
        ReportNewEntrantEmission.objects.bulk_create(emissions_to_create)
        # Clone the associated ReportNewEntrantProduction data
        old_productions = ReportNewEntrantProduction.objects.filter(report_new_entrant=old_report_version_new_entrant)
        productions_to_create = [
            ReportNewEntrantProduction(
                report_new_entrant=new_report_version_new_entrant,
                product=production.product,
                production_amount=production.production_amount,
            )
            for production in old_productions
        ]
        ReportNewEntrantProduction.objects.bulk_create(productions_to_create)

    @staticmethod
    @transaction.atomic
    def clone_report_version_verification(old_report_version: ReportVersion, new_report_version: ReportVersion) -> None:
        # Get the old ReportVerification associated with the old report version
        old_report_version_verification = ReportVerification.objects.filter(report_version=old_report_version).first()
        if not old_report_version_verification:
            return None
        # Clone the ReportVerification for the new report version
        new_report_version_verification = ReportVerification.objects.create(
            report_version=new_report_version,
            verification_body_name=old_report_version_verification.verification_body_name,
            accredited_by=old_report_version_verification.accredited_by,
            scope_of_verification=old_report_version_verification.scope_of_verification,
            threats_to_independence=old_report_version_verification.threats_to_independence,
            verification_conclusion=old_report_version_verification.verification_conclusion,
        )
        # Clone each ReportVerificationVisit for the new report version verification
        for old_visit in old_report_version_verification.report_verification_visits.all():
            ReportVerificationVisit.objects.create(
                report_verification=new_report_version_verification,
                visit_name=old_visit.visit_name,
                visit_type=old_visit.visit_type,
                is_other_visit=old_visit.is_other_visit,
                visit_coordinates=old_visit.visit_coordinates,
            )

    @staticmethod
    def clone_report_version_attachments(old_report_version: ReportVersion, new_report_version: ReportVersion) -> None:
        # Get all ReportAttachment instances associated with the old report version
        old_attachments = ReportAttachment.objects.filter(report_version_id=old_report_version)
        # Clone each attachment for the new report version
        for old_attachment in old_attachments:
            new_attachment = ReportAttachment(
                report_version=new_report_version,
                attachment=old_attachment.attachment,
                attachment_type=old_attachment.attachment_type,
                attachment_name=old_attachment.attachment_name,
            )
            new_attachment.save()

    @staticmethod
    def clone_report_version_facilities(old_report_version: ReportVersion, new_report_version: ReportVersion) -> None:
        # Get all facility reports for the old report version
        facility_reports = FacilityReport.objects.filter(report_version=old_report_version)
        for old_facility_report in facility_reports:
            # Create new facility report
            new_facility_report = FacilityReport.objects.create(
                facility=old_facility_report.facility,
                facility_name=old_facility_report.facility_name,
                facility_type=old_facility_report.facility_type,
                facility_bcghgid=old_facility_report.facility_bcghgid,
                report_version=new_report_version,
                is_completed=False,
            )
            # Clone facility report activities for the new facility report
            ReportSupplementaryVersionService.clone_report_version_facility_activities(
                old_facility_report, new_facility_report
            )
            # Clone facility report non-attributable emissions for the new facility report
            ReportSupplementaryVersionService.clone_report_version_facility_non_attributable_emissions(
                old_report_version, new_report_version, old_facility_report, new_facility_report
            )
            # Clone facility report production data for the new facility report
            ReportSupplementaryVersionService.clone_report_version_facility_product_data(
                old_report_version, new_report_version, old_facility_report, new_facility_report
            )

    @staticmethod
    @transaction.atomic
    def clone_report_version_facility_activities(
        old_facility_report: FacilityReport, new_facility_report: FacilityReport
    ) -> None:
        # Get activities from the old facility report
        old_activities = ReportActivity.objects.filter(facility_report=old_facility_report)
        # List to store the cloned activities
        cloned_activities = []
        # Clone each ReportActivity for the new facility report
        for old_activity in old_activities:
            new_activity = ReportSupplementaryVersionService.clone_report_version_facility_activity(
                old_activity, new_facility_report
            )
            cloned_activities.append(new_activity)
        # Set the M2M facility report to activity relationship
        new_facility_report.activities.set([a.activity for a in cloned_activities])

    @staticmethod
    def clone_report_version_facility_activity(
        old_activity: ReportActivity, new_facility_report: ReportActivity
    ) -> None:
        # Clone ReportActivity for the new facility report
        new_activity = ReportActivity.objects.create(
            report_version=new_facility_report.report_version,
            facility_report=new_facility_report,
            activity=old_activity.activity,
            json_data=old_activity.json_data,
            activity_base_schema=old_activity.activity_base_schema,
        )
        # Clone related source types for the new activity
        old_source_types = ReportSourceType.objects.filter(report_activity=old_activity)
        for old_source_type in old_source_types:
            ReportSupplementaryVersionService.clone_activity_source_type(old_source_type, new_activity)

        return new_activity

    @staticmethod
    def clone_activity_source_type(old_source_type: ReportSourceType, new_activity: ReportActivity) -> None:
        # Clone ReportSourceType for the new activity
        new_source_type = ReportSourceType.objects.create(
            report_version=new_activity.report_version,
            report_activity=new_activity,
            source_type=old_source_type.source_type,
            json_data=old_source_type.json_data,
            activity_source_type_base_schema=old_source_type.activity_source_type_base_schema,
        )
        # Clone units, fuels, or emissions based on schema
        if old_source_type.activity_source_type_base_schema.has_unit:
            ReportSupplementaryVersionService.clone_source_type_units(old_source_type, new_source_type)
        elif old_source_type.activity_source_type_base_schema.has_fuel:
            ReportSupplementaryVersionService.clone_source_type_fuels(
                old_source_type, new_source_type
            )  # Renamed method
        else:
            ReportSupplementaryVersionService.clone_source_type_emissions(
                old_source_type, new_source_type
            )  # Renamed method

    @staticmethod
    def clone_source_type_units(old_source_type: ReportSourceType, new_source_type: ReportSourceType) -> None:
        # Clone ReportUnit related to the source type
        old_units = ReportUnit.objects.filter(report_source_type=old_source_type)
        for old_unit in old_units:
            new_unit = ReportUnit.objects.create(
                report_version=new_source_type.report_version,
                report_source_type=new_source_type,
                type=old_unit.type,
                json_data=old_unit.json_data,
            )
            if old_source_type.activity_source_type_base_schema.has_fuel:
                ReportSupplementaryVersionService.clone_unit_fuels(old_source_type, new_source_type, old_unit, new_unit)
            else:
                ReportSupplementaryVersionService.clone_unit_emissions(
                    old_source_type, new_source_type, old_unit, new_unit
                )

    @staticmethod
    def clone_source_type_fuels(old_source_type: ReportSourceType, new_source_type: ReportSourceType) -> None:
        # Clone ReportFuel directly related to the source type (no unit)
        old_fuels = ReportFuel.objects.filter(report_source_type=old_source_type, report_unit__isnull=True)
        for old_fuel in old_fuels:
            new_fuel = ReportFuel.objects.create(
                report_version=new_source_type.report_version,
                report_source_type=new_source_type,
                fuel_type=old_fuel.fuel_type,
                json_data=old_fuel.json_data,
            )
            ReportSupplementaryVersionService.clone_fuel_emissions(old_source_type, new_source_type, old_fuel, new_fuel)

    @staticmethod
    def clone_unit_fuels(
        old_source_type: ReportSourceType, new_source_type: ReportSourceType, old_unit: ReportUnit, new_unit: ReportUnit
    ) -> None:
        # Clone ReportFuel associated to a given unit
        old_fuels = ReportFuel.objects.filter(report_source_type=old_source_type, report_unit=old_unit)
        for old_fuel in old_fuels:
            new_fuel = ReportFuel.objects.create(
                report_version=new_source_type.report_version,
                report_source_type=new_source_type,
                report_unit=new_unit,
                fuel_type=old_fuel.fuel_type,
                json_data=old_fuel.json_data,
            )
            ReportSupplementaryVersionService.clone_fuel_emissions(
                old_source_type, new_source_type, old_fuel, new_fuel, new_unit
            )

    @staticmethod
    def _clone_emission_common_fields(
        old_emission: ReportEmission,
        report_version,
        report_source_type,
        report_unit=None,
        report_fuel=None,
    ):
        new_emission = ReportEmission.objects.create(
            report_version=report_version,
            report_source_type=report_source_type,
            report_unit=report_unit,
            report_fuel=report_fuel,
            gas_type=old_emission.gas_type,
            json_data=old_emission.json_data,
        )
        # Clone ManyToManyField emission categories
        new_emission.emission_categories.set(old_emission.emission_categories.all())

        # Clone methodology
        ReportSupplementaryVersionService.clone_emission_methodology(old_emission, new_emission)

        return new_emission

    @staticmethod
    def clone_source_type_emissions(old_source_type: ReportSourceType, new_source_type: ReportSourceType) -> None:
        # Clone emissions related only to the source type (no unit, no fuel)
        old_emissions = ReportEmission.objects.filter(
            report_source_type=old_source_type, report_unit__isnull=True, report_fuel__isnull=True
        )
        for old_emission in old_emissions:
            ReportSupplementaryVersionService._clone_emission_common_fields(
                old_emission,
                report_version=new_source_type.report_version,
                report_source_type=new_source_type,
            )

    @staticmethod
    def clone_unit_emissions(
        old_source_type: ReportSourceType,
        new_source_type: ReportSourceType,
        old_unit: ReportUnit,
        new_unit: ReportUnit,
    ) -> None:
        # Clone emissions related to a unit (no fuel)
        old_emissions = ReportEmission.objects.filter(
            report_source_type=old_source_type, report_unit=old_unit, report_fuel__isnull=True
        )
        for old_emission in old_emissions:
            ReportSupplementaryVersionService._clone_emission_common_fields(
                old_emission,
                report_version=new_source_type.report_version,
                report_source_type=new_source_type,
                report_unit=new_unit,
            )

    @staticmethod
    def clone_fuel_emissions(
        old_source_type: ReportSourceType,
        new_source_type: ReportSourceType,
        old_fuel: ReportFuel,
        new_fuel: ReportFuel,
        new_unit: ReportUnit = None,
    ) -> None:
        # Clone emissions related to a fuel
        old_emissions = ReportEmission.objects.filter(report_source_type=old_source_type, report_fuel=old_fuel)
        for old_emission in old_emissions:
            ReportSupplementaryVersionService._clone_emission_common_fields(
                old_emission,
                report_version=new_source_type.report_version,
                report_source_type=new_source_type,
                report_fuel=new_fuel,
                report_unit=new_unit if old_emission.report_unit else None,
            )

    @staticmethod
    def clone_emission_methodology(old_emission: ReportEmission, new_emission: ReportEmission) -> None:
        # Clone methodology for the emission
        old_methodologies = ReportMethodology.objects.filter(report_emission=old_emission)
        for old_methodology in old_methodologies:
            ReportMethodology.objects.create(
                report_version=new_emission.report_version,
                report_emission=new_emission,
                methodology=old_methodology.methodology,
                json_data=old_methodology.json_data,
            )

    @staticmethod
    def clone_report_version_facility_non_attributable_emissions(
        old_report_version: ReportVersion,
        new_report_version: ReportVersion,
        old_facility_report: FacilityReport,
        new_facility_report: FacilityReport,
    ) -> None:
        # Get existing non-attributable emissions from old facility report
        existing_emissions = ReportNonAttributableEmissions.objects.filter(
            report_version=old_report_version, facility_report=old_facility_report
        )
        # Clone each ReportNonAttributableEmissions for the new facility report
        for old_emission in existing_emissions:
            cloned_emission = ReportNonAttributableEmissions.objects.create(
                report_version=new_report_version,
                facility_report=new_facility_report,
                activity=old_emission.activity,
                source_type=old_emission.source_type,
                emission_category=old_emission.emission_category,
            )
            cloned_emission.gas_type.set(old_emission.gas_type.all())  # Preserve gas types

    @staticmethod
    def clone_report_version_facility_product_data(
        old_report_version: ReportVersion,
        new_report_version: ReportVersion,
        old_facility_report: FacilityReport,
        new_facility_report: FacilityReport,
    ) -> None:
        # Get existing ReportProduct for the old facility report
        existing_report_products = ReportProduct.objects.filter(
            report_version=old_report_version, facility_report=old_facility_report
        )
        # Clone each ReportProduct entry
        for old_report_product in existing_report_products:
            new_report_product = ReportProduct.objects.create(
                report_version=new_report_version,
                facility_report=new_facility_report,
                product=old_report_product.product,
                annual_production=old_report_product.annual_production,
                production_data_apr_dec=old_report_product.production_data_apr_dec,
                production_methodology=old_report_product.production_methodology,
                production_methodology_description=old_report_product.production_methodology_description,
                storage_quantity_start_of_period=old_report_product.storage_quantity_start_of_period,
                storage_quantity_end_of_period=old_report_product.storage_quantity_end_of_period,
                quantity_sold_during_period=old_report_product.quantity_sold_during_period,
                quantity_throughput_during_period=old_report_product.quantity_throughput_during_period,
            )
            # For each ReportProduct call the product emission allocation cloning function
            ReportSupplementaryVersionService.clone_report_version_facility_product_emission_allocations(
                old_report_version=old_report_version,
                new_report_version=new_report_version,
                old_facility_report=old_facility_report,
                new_facility_report=new_facility_report,
                old_report_product=old_report_product,
                new_report_product=new_report_product,
            )

    @staticmethod
    def clone_report_version_facility_product_emission_allocations(
        old_report_version: ReportVersion,
        new_report_version: ReportVersion,
        old_facility_report: FacilityReport,
        new_facility_report: FacilityReport,
        old_report_product: ReportProduct,
        new_report_product: ReportProduct,
    ) -> None:
        # Get existing ReportProductEmissionAllocation
        existing_allocations = ReportProductEmissionAllocation.objects.filter(
            report_version=old_report_version,
            facility_report=old_facility_report,
            report_product=old_report_product,
        )
        # Clone each ReportProductEmissionAllocation entry
        for old_allocation in existing_allocations:
            ReportProductEmissionAllocation.objects.create(
                report_version=new_report_version,
                facility_report=new_facility_report,
                report_product=new_report_product,
                emission_category=old_allocation.emission_category,
                allocated_quantity=old_allocation.allocated_quantity,
                allocation_methodology=old_allocation.allocation_methodology,
                allocation_other_methodology_description=old_allocation.allocation_other_methodology_description,
            )
