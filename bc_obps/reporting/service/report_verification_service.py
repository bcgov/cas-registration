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
    def get_report_needs_verification(report_version_id: int) -> dict:
        """
        Determines if verification is needed and if the verification page should be shown.
        """
        REGULATED_PURPOSES = {
            Operation.Purposes.OBPS_REGULATED_OPERATION,
            Operation.Purposes.OPTED_IN_OPERATION,
            Operation.Purposes.NEW_ENTRANT_OPERATION,
        }
        EMISSION_THRESHOLD = Decimal("25000")

        purpose = ReportService.get_registration_purpose_by_version_id(report_version_id).get(
            "registration_purpose", {}
        )
        show_page = required = False

        if purpose in REGULATED_PURPOSES or purpose == Operation.Purposes.ELECTRICITY_IMPORT_OPERATION:
            show_page = True
            required = purpose in REGULATED_PURPOSES
        elif purpose == Operation.Purposes.REPORTING_OPERATION:
            totals = EmissionCategoryService.get_all_category_totals_by_version(report_version_id)
            if totals.get("attributable_for_threshold", Decimal("0")) >= EMISSION_THRESHOLD:
                show_page = required = True

        return {"show_verification_page": show_page, "verification_required": required}
