from decimal import Decimal
from django.db import transaction
from reporting.models.report_verification import ReportVerification
from reporting.models import ReportVersion
from reporting.schema.report_verification import ReportVerificationIn

from registration.models import Operation
from reporting.service.report_additional_data import ReportAdditionalDataService
from reporting.service.compliance_service import ComplianceService


class ReportVerificationService:
    @staticmethod
    def get_report_verification_by_version_id(
        report_version_id: int,
    ) -> ReportVerification:
        """
        Retrieve a ReportVerification instance for a given report version ID.

        Args:
            version_id: The report version ID

        Returns:
            ReportVerification instance
        """
        return ReportVerification.objects.get(report_version__id=report_version_id)

    @staticmethod
    @transaction.atomic
    def save_report_verification(version_id: int, data: ReportVerificationIn) -> ReportVerification:
        """
        Save or update a ReportVerification instance.

        Args:
            version_id: The report version ID
            data: Data for ReportVerification in the form of a ReportVerificationIn object

        Returns:
            ReportVerification instance
        """
        # Retrieve the associated report version
        data_defaults = {
            "verification_body_name": data.verification_body_name,
            "accredited_by": data.accredited_by,
            "scope_of_verification": data.scope_of_verification,
            "threats_to_independence": data.threats_to_independence,
            "verification_conclusion": data.verification_conclusion,
            "visit_name": data.visit_name,
            "visit_type": data.visit_type,
            "other_facility_name": data.other_facility_name,
            "other_facility_coordinates": data.other_facility_coordinates,
        }
        report_version = ReportVersion.objects.get(pk=version_id)
        # Update or create ReportVerification record
        report_verification, created = ReportVerification.objects.update_or_create(
            report_version=report_version,
            defaults=data_defaults,
        )

        return report_verification

    @staticmethod
    def get_report_needs_verification(version_id: int) -> bool:
        """
        Determines if a report needs verification data based on its purpose
        and attributable emissions.
        """
        REGULATED_OPERATION_PURPOSES = {
            Operation.Purposes.OBPS_REGULATED_OPERATION,
            Operation.Purposes.OPTED_IN_OPERATION,
            Operation.Purposes.NEW_ENTRANT_OPERATION,
        }
        ATTRIBUTABLE_EMISSION_THRESHOLD = Decimal("25000")  # 25,000 TCo₂e

        # Fetch registration purpose
        registration_purpose = ReportAdditionalDataService.get_registration_purpose_by_version_id(version_id)
        registration_purpose_value = registration_purpose.get("registration_purpose", {})

        # Check the REGULATED_OPERATION_PURPOSES
        if registration_purpose_value in REGULATED_OPERATION_PURPOSES:
            return True

        # Emission threshold: verification data is required if the registration purpose is Reporting Operation, and total TCo₂e >= 25,000
        if registration_purpose_value == Operation.Purposes.REPORTING_OPERATION:
            attributable_emissions = ComplianceService.get_emissions_attributable_for_reporting(version_id)
            return attributable_emissions >= ATTRIBUTABLE_EMISSION_THRESHOLD

        return False
