from dataclasses import dataclass, field
from decimal import Decimal
from typing import Literal, TypedDict

from compliance.models import ElicensingInvoice


@dataclass
class BCCRUnit:
    """Data model for BC Carbon Registry Unit information"""

    # Common fields
    id: str | None = None
    type: str | None = None
    serial_number: str | None = None
    vintage_year: str | None = None

    # BCCR Unit specific fields
    quantity_available: str | None = None
    quantity_to_be_applied: int = (
        0  # Default to 0, will be passed to the frontend to populate the input field
    )

    # Applied Compliance Unit specific fields
    quantity_applied: str | None = None
    equivalent_value: str | None = None


@dataclass
class AppliedComplianceUnit:
    """Data model for applied compliance units in grid format"""

    id: str | None = None
    type: str | None = None
    serial_number: str | None = None
    vintage_year: str | None = None
    quantity_applied: str | None = None
    equivalent_emission_reduced: str | None = None
    equivalent_value: str | None = None


@dataclass
class ComplianceUnitsPageData:
    """Data model for the Apply Compliance Units page data"""

    bccr_trading_name: str | None
    bccr_compliance_account_id: str | None
    charge_rate: Decimal | None
    outstanding_balance: Decimal | None
    bccr_units: list[BCCRUnit]
    compliance_unit_cap_limit: Decimal | None = None
    compliance_unit_cap_remaining: Decimal | None = None
    max_credit_usage_percentage: Decimal | None = None


@dataclass
class BCCRAccountResponseDetails:
    """Data model for BC Carbon Registry account details"""

    entity_id: str
    organization_classification_id: str
    type_of_account_holder: str | None
    trading_name: str


@dataclass
class BCCRComplianceAccountResponseDetails:
    """Data model for BC Carbon Registry compliance account"""

    master_account_name: str | None
    entity_id: str | None


## Elicensing Dataclasses


@dataclass
class RefreshWrapperReturn:
    data_is_fresh: bool
    invoice: ElicensingInvoice


class LastRefreshMetaData(TypedDict):
    last_refreshed_display: str
    data_is_fresh: bool


@dataclass
class MixedUnit:
    """Data model for a unit in the mixed unit list for BCCR transfer"""

    account_id: str
    serial_no: str
    new_quantity: int
    id: str


@dataclass
class TransferComplianceUnitsPayload:
    """Data model for the BCCR transfer compliance units API payload"""

    destination_account_id: str
    mixedUnitList: list[MixedUnit]


@dataclass
class ObligationData:
    """Data model for essential obligation information without payments"""

    reporting_year: int
    outstanding_balance: Decimal
    equivalent_value: Decimal
    obligation_id: str
    penalty_status: str
    fee_amount_dollars: Decimal | None


@dataclass
class ComplianceInvoiceContext:
    invoice_number: str
    invoice_date: str
    invoice_due_date: str
    invoice_printed_date: str
    invoice_is_void: bool
    operator_name: str
    operator_address_line1: str
    operator_address_line2: str
    operation_name: str
    compliance_obligation_id: str
    billing_items: list[dict]
    total_amount_due: str
    logo_base64: str


@dataclass
class ObligationInvoiceContext(ComplianceInvoiceContext):
    compliance_obligation_year: int
    compliance_obligation: str
    compliance_obligation_charge_rate: str
    compliance_obligation_equivalent_amount: str


@dataclass
class AutomaticOverduePenaltyInvoiceContext(ComplianceInvoiceContext):
    penalty_amount: str


@dataclass
class ComplianceEarnedCreditsUpdate:
    """Data model for the BCCR earned credits update API payload"""

    bccr_trading_name: str | None = (
        None  # Only required for industry users - we enforce this in the service layer
    )
    bccr_holding_account_id: str | None = (
        None  # Only required for industry users - we enforce this in the service layer
    )
    analyst_suggestion: (
        Literal[
            "Ready to approve",
            "Requiring change of BCCR Holding Account ID",
            "Requiring supplementary report",
        ]
        | None
    ) = None
    analyst_comment: str | None = None
    director_comment: str | None = None
    director_decision: Literal["Approved", "Declined"] | None = None


@dataclass(slots=True, frozen=True)
class InvoiceAdjustment:
    """
    Immutable, per-invoice action the poster will apply to a *previous* CRV's invoice.
    - version_id: compliance report version id
    - applied: signed $, negative reduces outstanding
    - net_outstanding_after: $ after applying `applied`
    - mark_fully_met: True if net_outstanding_after == 0
    - should_void_invoice: True if fully met & no prior cash payments
    """

    version_id: int
    applied: Decimal
    net_outstanding_after: Decimal
    mark_fully_met: bool
    should_void_invoice: bool


@dataclass(slots=True, frozen=True)
class AdjustmentStrategy:
    """
    Immutable, normalized contract consumed by `DecreasedObligationHandler._process_adjustment_after_commit(...)`

    - invoices: invoice-level adjustments to apply
    - manual_handling_context: the manual-handling context to record, or None if manual handling is not required
    - earned_credits_tonnes: earned credits to create on the NEW CRV (tonnes)
    - should_create_earned_credits: whether to create an earned-credits record
    """

    invoices: list["InvoiceAdjustment"] = field(default_factory=list)
    manual_handling_context: str | None = None

    earned_credits_tonnes: Decimal = Decimal("0")
    should_create_earned_credits: bool = False

    @staticmethod
    def empty() -> "AdjustmentStrategy":
        return AdjustmentStrategy()


@dataclass
class ManualHandlingUpdate:
    """
    Payload for manual handling updates.
    """

    analyst_comment: str | None = None
    director_decision: Literal["action_required", "issue_resolved"] | None = None
