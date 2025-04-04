from typing import Optional
from decimal import Decimal
from django.db import transaction
from reporting.service.emission_category_service import EmissionCategoryService
from reporting.models.report_verification import ReportVerification
from reporting.models.report_verification_visit import ReportVerificationVisit
from reporting.models import ReportVersion
from registration.models import Operation
from reporting.schema.report_verification import ReportVerificationIn
from service.report_service import ReportService


class ReportVerificationService:
    @staticmethod
    def get_report_verification_by_version_id(
        report_version_id: int,
    ) -> Optional[ReportVerification]:
        """
        Retrieve a ReportVerification instance for a given report version ID.

        Args:
            report_version_id: The report version ID

        Returns:
            ReportVerification instance
        """
        return ReportVerification.objects.filter(report_version__id=report_version_id).first()

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
        report_version = ReportVersion.objects.get(pk=version_id)

        # Prepare the defaults for the ReportVerification object
        data_defaults = {
            "verification_body_name": data.verification_body_name,
            "accredited_by": data.accredited_by,
            "scope_of_verification": data.scope_of_verification,
            "threats_to_independence": data.threats_to_independence,
            "verification_conclusion": data.verification_conclusion,
        }

        # Update or create ReportVerification record
        report_verification, _ = ReportVerification.objects.update_or_create(
            report_version=report_version,
            defaults=data_defaults,
        )

        # Process ReportVerificationVisit records
        provided_visits = data.report_verification_visits
        visit_ids_to_keep = []

        for visit_data in provided_visits:
            visit_defaults = {
                "visit_type": visit_data.visit_type,
                "is_other_visit": visit_data.is_other_visit,
                "visit_coordinates": visit_data.visit_coordinates,
            }

            visit, _ = ReportVerificationVisit.objects.update_or_create(
                report_verification=report_verification,
                visit_name=visit_data.visit_name,
                defaults=visit_defaults,
            )
            visit_ids_to_keep.append(visit.id)

        # Delete any visits not included in the current payload
        ReportVerificationVisit.objects.filter(report_verification=report_verification).exclude(
            id__in=visit_ids_to_keep
        ).delete()

        return report_verification

    @staticmethod
    def get_report_needs_verification(report_version_id: int) -> bool:
        """
        Determines if a report needs verification data based on its purpose
        and emissions attributable for reporting threshold
        """
        REGULATED_OPERATION_PURPOSES = {
            Operation.Purposes.OBPS_REGULATED_OPERATION,
            Operation.Purposes.OPTED_IN_OPERATION,
            Operation.Purposes.NEW_ENTRANT_OPERATION,
        }
        ATTRIBUTABLE_EMISSION_THRESHOLD = Decimal("25000")  # 25,000 TCo₂e

        # Fetch registration purpose
        registration_purpose = ReportService.get_registration_purpose_by_version_id(report_version_id)
        registration_purpose_value = registration_purpose.get("registration_purpose", {})

        # Check the REGULATED_OPERATION_PURPOSES
        if registration_purpose_value in REGULATED_OPERATION_PURPOSES:
            return True

        # Emission threshold: verification data is required if the registration purpose is Reporting Operation, and attributable_for_threshold TCo₂e >= 25,000
        if registration_purpose_value == Operation.Purposes.REPORTING_OPERATION:
            totals = EmissionCategoryService.get_all_category_totals_by_version(report_version_id)
            attributable_for_threshold = totals.get("attributable_for_threshold")
            return (attributable_for_threshold or Decimal("0")) >= ATTRIBUTABLE_EMISSION_THRESHOLD

        return False
