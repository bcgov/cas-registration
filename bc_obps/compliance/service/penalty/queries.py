# bc_obps/compliance/service/penalty/queries.py

from decimal import Decimal
from django.db.models import QuerySet, Sum
from compliance.models import CompliancePenalty

ZERO_DOLLARS = Decimal("0.00")


def outstanding_penalties(
    penalties: QuerySet[CompliancePenalty],
) -> QuerySet[CompliancePenalty]:
    """
    Canonical definition of an 'outstanding penalty':
    - has an eLicensing invoice
    - invoice is not void
    - invoice outstanding balance > 0
    """
    return penalties.filter(
        elicensing_invoice__isnull=False,
        elicensing_invoice__is_void=False,
        elicensing_invoice__outstanding_balance__gt=ZERO_DOLLARS,
    )


def has_outstanding_penalty(
    penalties: QuerySet[CompliancePenalty],
) -> bool:
    return outstanding_penalties(penalties).exists()


def sum_outstanding_penalty_balance(
    penalties: QuerySet[CompliancePenalty],
) -> Decimal:
    return (
        outstanding_penalties(penalties).aggregate(total=Sum("elicensing_invoice__outstanding_balance")).get("total")
        or ZERO_DOLLARS
    )
