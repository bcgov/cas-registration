from datetime import date, datetime, time, timedelta
from decimal import Decimal
from typing import Any, Dict
from django.http import HttpRequest
from django.utils import timezone
from compliance.models import ComplianceObligation, ComplianceReportVersion, ElicensingInterestRate
from rls.utils.manager import RlsManager
from ..schemas import ScenarioPayload
from .automatic_overdue_penalty import AutomaticOverduePenaltyScenario


class SupplementaryLateSubmissionScenario(AutomaticOverduePenaltyScenario):
    """
    Builds on the automatic overdue penalty scenario to make the compliance report version a
    supplementary report submitted after the compliance deadline, so GGEAPAR interest applies
    and accrues from the day after the deadline.

    Payload options (in addition to the base scenario's):
        days_after_deadline: Days after the compliance deadline the obligation was created (default 10)
    """

    DEFAULT_DAYS_AFTER_DEADLINE = 10
    DEFAULT_INTEREST_RATE = Decimal("0.0625")

    def execute(self, request: HttpRequest, data: ScenarioPayload) -> Dict[str, Any]:
        # The base scenario seeds the overdue obligation and invoice, and resets the version to an original report
        result = super().execute(request, data)
        crv_id = result["compliance_report_version_id"]
        days_after_deadline = int((data.payload or {}).get("days_after_deadline", self.DEFAULT_DAYS_AFTER_DEADLINE))

        with RlsManager.bypass_rls():
            crv = ComplianceReportVersion.objects.select_related("compliance_report__compliance_period").get(id=crv_id)

            # A supplementary report needs a previous version: the compliance dashboard reads its status.
            # A real one cannot be created here because report compliance summaries are immutable once their
            # report version is submitted, so the report is linked to another existing version, left unchanged.
            previous_version = ComplianceReportVersion.objects.exclude(id=crv_id).order_by("id").first()
            if previous_version is None:
                raise ValueError("A supplementary scenario needs a second compliance report version to link to")

            # GGEAPAR interest is calculated from the eLicensing interest rates, which are normally synced
            # by a scheduled task. Seed one rate covering all dates only when none have been synced.
            if not ElicensingInterestRate.objects.exists():
                ElicensingInterestRate.objects.create(
                    interest_rate=self.DEFAULT_INTEREST_RATE,
                    start_date=date(2000, 1, 1),
                    end_date=date(2099, 12, 31),
                    is_current_rate=True,
                )

            # Marks the version supplementary, which is what makes GGEAPAR interest applicable
            crv.is_supplementary = True
            crv.previous_version = previous_version
            crv.save(update_fields=["is_supplementary", "previous_version"])

            # created_at is the submission date. A DB trigger sets it on insert only, so an update can backdate it.
            # Creating it after the deadline is what makes the submission late, so interest accrues.
            deadline = crv.compliance_report.compliance_period.compliance_deadline
            submitted_at = timezone.make_aware(
                datetime.combine(deadline + timedelta(days=days_after_deadline), time(12, 0))
            )
            ComplianceObligation.objects.filter(compliance_report_version_id=crv_id).update(created_at=submitted_at)

        return {
            **result,
            "is_supplementary": True,
            "obligation_created_at": submitted_at.isoformat(),
        }
