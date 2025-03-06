from django.db import transaction
from reporting.models.facility_report import FacilityReport
from reporting.models.report import Report
from reporting.models.report_operation import ReportOperation
from reporting.models.report_version import ReportVersion
from service.data_access_service.facility_service import FacilityDataAccessService
from reporting.models import ReportOperationRepresentative, ReportPersonResponsible
from reporting.models import (
    ReportActivity,
    ReportAdditionalData,
    ReportAttachment,
    ReportEmission,
    ReportFuel,
    ReportNewEntrant,
    ReportNewEntrantEmission,
    ReportNewEntrantProduction,
    ReportOperation,
    ReportOperationRepresentative,
    ReportPersonResponsible,
    ReportSourceType,
    ReportUnit,
    ReportVerification,
    ReportVerificationVisit
)

class ReportVersionService:
    def __init__(self):
        pass

    @staticmethod
    @transaction.atomic
    def create_report_version(
        report: Report,
        report_type: str = "Annual Report",
    ) -> ReportVersion:
        # Creating first version
        report_version = ReportVersion.objects.create(report=report, report_type=report_type)
        # Pre-populating data to the first version
        operation = report.operation
        operator = report.operator

        report_operation = ReportOperation.objects.create(
            operator_legal_name=operator.legal_name,
            operator_trade_name=operator.trade_name,
            operation_name=operation.name,
            operation_type=operation.type,
            operation_bcghgid=operation.bcghg_id.id if operation.bcghg_id else None,
            bc_obps_regulated_operation_id=(
                operation.bc_obps_regulated_operation.id if operation.bc_obps_regulated_operation else ""
            ),
            report_version=report_version,
        )

        for contact in operation.contacts.all():
            ReportOperationRepresentative.objects.create(
                report_version=report_version,
                representative_name=contact.get_full_name(),
                selected_for_report=True,
            )
        report_operation.activities.add(*list(operation.activities.all()))
        report_operation.regulated_products.add(*list(operation.regulated_products.all()))

        facilities = FacilityDataAccessService.get_current_facilities_by_operation(operation)

        for f in facilities:
            facility_report = FacilityReport.objects.create(
                facility=f,
                facility_name=f.name,
                facility_type=f.type,
                facility_bcghgid=f.bcghg_id.id if f.bcghg_id else None,
                report_version=report_version,
                is_completed=False,
            )
            facility_report.activities.add(*list(operation.activities.all()))

        return report_version

    @staticmethod
    def delete_report_version(report_version_id: int) -> None:
        report_version = ReportVersion.objects.get(id=report_version_id)
        report_version.delete()

    @staticmethod
    @transaction.atomic
    def change_report_version_type(report_version_id: int, new_report_type: str) -> ReportVersion:
        report_version = ReportVersion.objects.get(id=report_version_id)
        if report_version.report_type == new_report_type:
            return report_version

        ReportVersionService.delete_report_version(report_version.id)
        new_report_version = ReportVersionService.create_report_version(report_version.report, new_report_type)

        return new_report_version
   

    @staticmethod
    @transaction.atomic
    def create_supplementary_report_version(report_version_id: int) -> ReportVersion:       
        """
        Creates a new report version for a given report version ID with cloned data.

        Args:
            report_version_id: The report version ID

        Returns:
            New ReportVersion instance
        """

        # Retrieve the existing report version
        report_version = ReportVersion.objects.get(id=report_version_id)
        # Set this version is no longer the latest submitted one
        report_version.is_latest_submitted=False
        report_version.save()

        # Create a new report version as a Draft
        new_report_version = ReportVersion.objects.create(
            report=report_version.report,
            report_type=report_version.report_type,
            status=ReportVersion.ReportVersionStatus.Draft,
            is_latest_submitted=False,
        )
        try:
            # Clone related data
            ReportVersionService.clone_report_operation(report_version, new_report_version)
            ReportVersionService.clone_report_representatives(report_version, new_report_version)
            ReportVersionService.clone_report_person_responsible(report_version, new_report_version)
            ReportVersionService.clone_report_additional_data(report_version, new_report_version)
            ReportVersionService.clone_report_new_entrant_data(report_version, new_report_version)
            ReportVersionService.clone_report_verification(report_version, new_report_version)
            ReportVersionService.clone_report_attachments(report_version, new_report_version)
            
            # ReportVersionService.clone_report_facilities(report_version, new_report_version)
            # ReportVersionService.clone_activity(report_version, new_report_version)
        
        except Exception as e:
                    print(f"Error occurred while cloning related data: {e}")
                    raise  # Re-raise the exception to ensure transaction rollback

        # Return the newly created report version
        return new_report_version

    @staticmethod
    def clone_report_operation(old_report_version: ReportVersion, new_report_version: ReportVersion):
  
        # Retrieve the old ReportOperation associated with the old report version
        old_report_operation = ReportOperation.objects.get(report_version=old_report_version)
        
        # Create a new ReportOperation for the new report version with data copied from the old one
        new_report_operation = ReportOperation.objects.create(
            operator_legal_name=old_report_operation.operator_legal_name,
            operator_trade_name=old_report_operation.operator_trade_name,
            operation_name=old_report_operation.operation_name,
            operation_type=old_report_operation.operation_type,
            operation_bcghgid=old_report_operation.operation_bcghgid,
            bc_obps_regulated_operation_id=old_report_operation.bc_obps_regulated_operation_id,
            report_version=new_report_version,
        )
        
        # Clone the related activities and regulated products to the new ReportOperation
        new_report_operation.activities.set(old_report_operation.activities.all())
        new_report_operation.regulated_products.set(old_report_operation.regulated_products.all())

    @staticmethod
    def clone_report_representatives(old_report_version: ReportVersion, new_report_version: ReportVersion):

        # Retrieve all ReportOperationRepresentatives associated with the old report version
        representatives = ReportOperationRepresentative.objects.filter(report_version=old_report_version)
        
        # Create new ReportOperationRepresentatives for the new report version with data copied from the old ones
        for rep in representatives:
            ReportOperationRepresentative.objects.create(
                report_version=new_report_version,
                representative_name=rep.representative_name,
                selected_for_report=rep.selected_for_report,
            )

    @staticmethod
    def clone_report_person_responsible(old_report_version: ReportVersion, new_report_version: ReportVersion):

        # Retrieve the ReportPersonResponsible associated with the old report version
        old_report_person_responsible = ReportPersonResponsible.objects.filter(report_version=old_report_version).first()
        
        # If a ReportPersonResponsible exists, create a new one for the new report version
        if old_report_person_responsible:
            ReportPersonResponsible.objects.create(
                report_version=new_report_version,
                first_name=old_report_person_responsible.first_name,
                last_name=old_report_person_responsible.last_name,
                email=old_report_person_responsible.email,
                phone_number=old_report_person_responsible.phone_number,
                position_title=old_report_person_responsible.position_title,
                business_role=old_report_person_responsible.business_role,
                street_address=old_report_person_responsible.street_address,
                municipality=old_report_person_responsible.municipality,
                province=old_report_person_responsible.province,
                postal_code=old_report_person_responsible.postal_code,
            )

    @staticmethod
    def clone_report_additional_data(old_report_version: ReportVersion, new_report_version: ReportVersion):

        # Retrieve the ReportAdditionalData associated with the old report version
        old_report_additional_data = ReportAdditionalData.objects.filter(report_version=old_report_version).first()
        
        # If ReportAdditionalData exists, create a new one for the new report version
        if old_report_additional_data:
            ReportAdditionalData.objects.create(
                report_version=new_report_version,
                capture_emissions=old_report_additional_data.capture_emissions,
                emissions_on_site_use=old_report_additional_data.emissions_on_site_use,
                emissions_on_site_sequestration=old_report_additional_data.emissions_on_site_sequestration,
                emissions_off_site_transfer=old_report_additional_data.emissions_off_site_transfer,
                electricity_generated=old_report_additional_data.electricity_generated,
            )

    @staticmethod
    @transaction.atomic
    def clone_report_new_entrant_data(old_report_version_id: int, new_report_version: ReportVersion):
   
        # Retrieve the old ReportNewEntrant data
        old_report_new_entrant = ReportNewEntrant.objects.filter(report_version_id=old_report_version_id).first()
        if not old_report_new_entrant:
            return None

        # Create a new ReportNewEntrant for the new report version
        new_report_new_entrant = ReportNewEntrant.objects.create(
            report_version=new_report_version,
            authorization_date=old_report_new_entrant.authorization_date,
            first_shipment_date=old_report_new_entrant.first_shipment_date,
            new_entrant_period_start=old_report_new_entrant.new_entrant_period_start,
            assertion_statement=old_report_new_entrant.assertion_statement,
        )

        # Clone the associated ReportNewEntrantEmission data
        old_emissions = ReportNewEntrantEmission.objects.filter(report_new_entrant=old_report_new_entrant)
        emissions_to_create = [
            ReportNewEntrantEmission(
                report_new_entrant=new_report_new_entrant,
                emission_category=emission.emission_category,
                emission=emission.emission,
            )
            for emission in old_emissions
        ]
        ReportNewEntrantEmission.objects.bulk_create(emissions_to_create)

        # Clone the associated ReportNewEntrantProduction data
        old_productions = ReportNewEntrantProduction.objects.filter(report_new_entrant=old_report_new_entrant)
        productions_to_create = [
            ReportNewEntrantProduction(
                report_new_entrant=new_report_new_entrant,
                product=production.product,
                production_amount=production.production_amount,
            )
            for production in old_productions
        ]
        ReportNewEntrantProduction.objects.bulk_create(productions_to_create)
   
    @staticmethod
    @transaction.atomic
    def clone_report_verification(old_report_version: ReportVersion, new_report_version: ReportVersion):
   
        # Retrieve the old ReportVerification associated with the old report version
        old_report_verification = ReportVerification.objects.filter(report_version=old_report_version).first()
        if not old_report_verification:
            return None

        # Create a new ReportVerification for the new report version with data copied from the old one
        new_report_verification = ReportVerification.objects.create(
            report_version=new_report_version,
            verification_body_name=old_report_verification.verification_body_name,
            accredited_by=old_report_verification.accredited_by,
            scope_of_verification=old_report_verification.scope_of_verification,
            threats_to_independence=old_report_verification.threats_to_independence,
            verification_conclusion=old_report_verification.verification_conclusion,
        )

        # Clone the associated ReportVerificationVisit records
        for old_visit in old_report_verification.report_verification_visits.all():
            ReportVerificationVisit.objects.create(
                report_verification=new_report_verification,
                visit_name=old_visit.visit_name,
                visit_type=old_visit.visit_type,
                is_other_visit=old_visit.is_other_visit,
                visit_coordinates=old_visit.visit_coordinates,
            )

    @staticmethod
    def clone_report_attachments(old_report_version: ReportVersion, new_report_version: ReportVersion):

        # Retrieve all ReportAttachment instances associated with the old report version
        old_attachments = ReportAttachment.objects.filter(report_version_id=old_report_version)

        # Clone each attachment to the new report version
        for old_attachment in old_attachments:
            new_attachment = ReportAttachment(
                report_version=new_report_version,
                attachment=old_attachment.attachment,
                attachment_type=old_attachment.attachment_type,
                attachment_name=old_attachment.attachment_name,
            )
            new_attachment.save()

    @staticmethod
    def clone_report_facilities(old_report_version: ReportVersion, new_report_version: ReportVersion):
        facility_reports = FacilityReport.objects.filter(report_version=old_report_version)
        for facility_report in facility_reports:
            new_facility_report = FacilityReport.objects.create(
                facility=facility_report.facility,
                facility_name=facility_report.facility_name,
                facility_type=facility_report.facility_type,
                facility_bcghgid=facility_report.facility_bcghgid,
                report_version=new_report_version,
                is_completed=False,
            )
            new_facility_report.activities.set(facility_report.activities.all())

    @transaction.atomic
    def clone_activities(self, old_report_version, new_report_version, facility_id):
        old_facility_report = FacilityReport.objects.get(report_version=old_report_version, facility_id=facility_id)
        new_facility_report = FacilityReport.objects.get(report_version=new_report_version, facility_id=facility_id)

        old_activities = ReportActivity.objects.filter(facility_report=old_facility_report)

        cloned_activities = []
        for old_activity in old_activities:
            new_activity = self.clone_activity(old_activity, new_facility_report)
            cloned_activities.append(new_activity)

        return cloned_activities

    def clone_activity(self, old_activity, new_facility_report):
        new_activity = ReportActivity.objects.create(
            report_version=new_facility_report.report_version,
            facility_report=new_facility_report,
            activity=old_activity.activity,
            json_data=old_activity.json_data,
            activity_base_schema=old_activity.activity_base_schema,
        )

        # Clone related source types
        old_source_types = ReportSourceType.objects.filter(report_activity=old_activity)
        for old_source_type in old_source_types:
            self.clone_source_type(old_source_type, new_activity)

        return new_activity

    def clone_source_type(self, old_source_type, new_activity):
        new_source_type = ReportSourceType.objects.create(
            report_version=new_activity.report_version,
            report_activity=new_activity,
            source_type=old_source_type.source_type,
            json_data=old_source_type.json_data,
            activity_source_type_base_schema=old_source_type.activity_source_type_base_schema,
        )

        # Clone units, fuels, or emissions based on schema
        if old_source_type.activity_source_type_base_schema.has_unit:
            self.clone_units(old_source_type, new_source_type)
        elif old_source_type.activity_source_type_base_schema.has_fuel:
            self.clone_fuels(old_source_type, new_source_type)
        else:
            self.clone_emissions(old_source_type, new_source_type)

    def clone_units(self, old_source_type, new_source_type):
        old_units = ReportUnit.objects.filter(report_source_type=old_source_type)
        for old_unit in old_units:
            new_unit = ReportUnit.objects.create(
                report_version=new_source_type.report_version,
                report_source_type=new_source_type,
                type=old_unit.type,
                json_data=old_unit.json_data,
            )
            self.clone_fuels(old_source_type, new_source_type, new_unit)

    def clone_fuels(self, old_source_type, new_source_type, new_unit=None):
        old_fuels = ReportFuel.objects.filter(report_source_type=old_source_type, report_unit=new_unit)
        for old_fuel in old_fuels:
            new_fuel = ReportFuel.objects.create(
                report_version=new_source_type.report_version,
                report_source_type=new_source_type,
                report_unit=new_unit,
                fuel_type=old_fuel.fuel_type,
                json_data=old_fuel.json_data,
            )
            self.clone_emissions(old_source_type, new_source_type, new_fuel)

    def clone_emissions(self, old_source_type, new_source_type, new_fuel=None, new_unit=None):
        old_emissions = ReportEmission.objects.filter(
            report_source_type=old_source_type, report_fuel=new_fuel, report_unit=new_unit
        )
        for old_emission in old_emissions:
            ReportEmission.objects.create(
                report_version=new_source_type.report_version,
                report_source_type=new_source_type,
                report_fuel=new_fuel,
                report_unit=new_unit,
                gas_type=old_emission.gas_type,
                json_data=old_emission.json_data,
            )

    
