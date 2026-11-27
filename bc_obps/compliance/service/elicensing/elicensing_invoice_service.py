from decimal import Decimal
from uuid import UUID

from compliance.enums import ComplianceInvoiceTypes
from compliance.models import (
    ElicensingInvoice,
    ElicensingLineItem,
)
from compliance.models.compliance_penalty import CompliancePenalty
from compliance.models.elicensing_adjustment import ElicensingAdjustment
from compliance.models.elicensing_payment import ElicensingPayment
from compliance.schema.elicensing_invoice import ElicensingInvoiceFilterSchema
from django.db.models import (
    Case,
    DecimalField,
    F,
    OuterRef,
    Q,
    QuerySet,
    Subquery,
    Sum,
    Value,
    When,
)
from django.db.models.functions import Coalesce
from ninja import Query
from registration.service.data_access_service.user_service import UserDataAccessService
from registration.service.user_operator_service import UserOperatorService

# string formatter for dates that appear in invoices
STRFTIME_FORMAT = "%b %-d, %Y"


class ElicensingInvoiceService:
    @classmethod
    def get_elicensing_invoice_for_dashboard(
        cls,
        user_guid: UUID,
        sort_field: str | None,
        sort_order: str | None,
        filters: ElicensingInvoiceFilterSchema = Query(...),
    ) -> QuerySet[ElicensingInvoice]:
        """
        Fetches all compliance invoices for the user's operations.
        """
        invoice_total_subquery = (
            ElicensingLineItem.objects.filter(
                elicensing_invoice_id=OuterRef("pk"),
                line_item_type=ElicensingLineItem.LineItemType.FEE,
            )
            .values("elicensing_invoice_id")
            .annotate(total=Sum("base_amount"))
            .values("total")
        )
        total_payments_subquery = (
            ElicensingPayment.objects.filter(
                elicensing_line_item__elicensing_invoice_id=OuterRef("pk"),
            )
            .values("elicensing_line_item__elicensing_invoice_id")
            .annotate(total=Sum("amount"))
            .values("total")
        )

        total_adjustments_subquery = (
            ElicensingAdjustment.objects.filter(
                elicensing_line_item__elicensing_invoice_id=OuterRef("pk"),
                elicensing_line_item__line_item_type=ElicensingLineItem.LineItemType.FEE,
            )
            .values("elicensing_line_item__elicensing_invoice_id")
            .annotate(total=Sum("amount"))
            .values("total")
        )

        faa_interest_total_subquery = (
            ElicensingLineItem.objects.filter(
                elicensing_invoice_id=OuterRef("pk"),
                line_item_type=ElicensingLineItem.LineItemType.INTEREST,
            )
            .values("elicensing_invoice_id")
            .annotate(total=Sum("base_amount"))
            .values("total")
        )

        user = UserDataAccessService.get_by_guid(user_guid)
        qs = ElicensingInvoice.objects.select_related(
            "compliance_obligation__compliance_report_version__compliance_report__report__reporting_year",
            "compliance_obligation__compliance_report_version__report_compliance_summary__report_version__report_operation",
            "compliance_penalty__compliance_obligation__compliance_report_version__compliance_report__report__reporting_year",
            "compliance_penalty__compliance_obligation__compliance_report_version__report_compliance_summary__report_version__report_operation",
        ).annotate(
            compliance_report_version_id=Coalesce(
                F("compliance_obligation__compliance_report_version_id"),
                F(
                    "compliance_penalty__compliance_obligation__compliance_report_version_id"
                ),
            ),
            compliance_period=Coalesce(
                F(
                    "compliance_obligation__compliance_report_version__compliance_report__report__reporting_year__reporting_year"
                ),
                F(
                    "compliance_penalty__compliance_obligation__compliance_report_version__compliance_report__report__reporting_year__reporting_year"
                ),
            ),
            operation_name=Coalesce(
                F(
                    "compliance_obligation__compliance_report_version__report_compliance_summary__report_version__report_operation__operation_name"
                ),
                F(
                    "compliance_penalty__compliance_obligation__compliance_report_version__report_compliance_summary__report_version__report_operation__operation_name"
                ),
            ),
            operator_legal_name=Coalesce(
                F(
                    "compliance_obligation__compliance_report_version__report_compliance_summary__report_version__report_operation__operator_legal_name"
                ),
                F(
                    "compliance_penalty__compliance_obligation__compliance_report_version__report_compliance_summary__report_version__report_operation__operator_legal_name"
                ),
            ),
            invoice_type=Case(
                When(
                    Q(compliance_penalty__isnull=False)
                    & Q(
                        compliance_penalty__penalty_type=CompliancePenalty.PenaltyType.LATE_SUBMISSION
                    ),
                    then=Value(ComplianceInvoiceTypes.LATE_SUBMISSION_PENALTY.value),
                ),
                When(
                    compliance_penalty__isnull=False,
                    then=Value(ComplianceInvoiceTypes.AUTOMATIC_OVERDUE_PENALTY.value),
                ),
                default=Value(ComplianceInvoiceTypes.OBLIGATION.value),
            ),
            invoice_total=Coalesce(
                Subquery(invoice_total_subquery),
                0,
                output_field=DecimalField(max_digits=12, decimal_places=2),
            ),
            total_payments=Coalesce(
                Subquery(total_payments_subquery),
                0,
                output_field=DecimalField(max_digits=12, decimal_places=2),
            ),
            total_adjustments=Coalesce(
                Subquery(total_adjustments_subquery),
                0,
                output_field=DecimalField(max_digits=12, decimal_places=2),
            ),
            faa_sub_interest_total=Coalesce(
                Subquery(faa_interest_total_subquery),
                0,
                output_field=DecimalField(max_digits=12, decimal_places=2),
            ),
            faa_interest_total=Case(
                When(
                    invoice_fee_balance__gt=Decimal("0.00"),
                    then=F("invoice_interest_balance"),
                ),
                default=F("faa_sub_interest_total"),
                output_field=DecimalField(max_digits=12, decimal_places=2),
            ),
        )

        if user.is_irc_user():
            compliance_invoices = qs.all()
        else:
            operator = (
                UserOperatorService.get_current_user_approved_user_operator_or_raise(
                    user
                ).operator
            )
            compliance_invoices = qs.filter(
                Q(
                    compliance_obligation__compliance_report_version__compliance_report__report__operator=operator
                )
                | Q(
                    compliance_penalty__compliance_obligation__compliance_report_version__compliance_report__report__operator=operator
                )
            )
        # Build a Django order_by key from the requested sort inputs.
        order = (sort_order or "asc").lower()
        sort_direction = "-" if order == "desc" else ""
        sort_by = f"{sort_direction}{sort_field}" if sort_field else None
        result = filters.filter(compliance_invoices)
        if sort_by:
            result = result.order_by(sort_by)
        return result
