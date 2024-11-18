from reporting.models.report_verification import ReportVerification

from reporting.models import ReportVersion
from registration.models import Facility
from django.db import transaction
from django.core.exceptions import ObjectDoesNotExist, ValidationError
from reporting.schema.report_verification import ReportVerificationIn
from typing import List, Dict

class ReportVerificationService:
    @staticmethod
    @transaction.atomic
    def save_report_verification(
        version_id: int, data: ReportVerificationIn
    ) -> ReportVerification:
        """
        Save or update a ReportVerification instance.

        Args:
            version_id: The report version ID
            data: Data for ReportVerification in the form of a ReportVerificationIn object

        Returns:
            ReportVerification instance
        """
        # Retrieve the associated report version
        try:
            data_defaults= {
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
        except ValidationError as ve:
            print("Validation error:", ve)
            raise ve
        except ObjectDoesNotExist as ode:
            print("Related object not found:", ode)
            raise ode
        except Exception as e:
            print("General error:", e)
            raise e