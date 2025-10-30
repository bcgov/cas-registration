from decimal import Decimal
from dataclasses import dataclass, field
from typing import Literal, Optional, List, TypedDict
from django.db.models import QuerySet
from compliance.models import ElicensingPayment, ElicensingInvoice


@dataclass
class BCCRUnit:
    """Data model for BC Carbon Registry Unit information"""

    # Common fields
    id: Optional[str] = None
    type: Optional[str] = None
    serial_number: Optional[str] = None
    vintage_year: Optional[int] = None

    # BCCR Unit specific fields
    quantity_available: Optional[str] = None
    quantity_to_be_applied: int = 0  # Default to 0, will be passed to the frontend to populate the input field

    # Applied Compliance Unit specific fields
    quantity_applied: Optional[str] = None
    equivalent_value: Optional[str] = None


@dataclass
class AppliedComplianceUnit:
    """Data model for applied compliance units in grid format"""

    id: Optional[str] = None
    type: Optional[str] = None
    serial_number: Optional[str] = None
    vintage_year: Optional[int] = None
    quantity_applied: Optional[str] = None
    equivalent_emission_reduced: Optional[str] = None
    equivalent_value: Optional[str] = None


@dataclass
class ComplianceUnitsPageData:
    """Data model for the Apply Compliance Units page data"""

    bccr_trading_name: Optional[str]
    bccr_compliance_account_id: Optional[str]
    charge_rate: Optional[Decimal]
    outstanding_balance: Optional[Decimal]
    bccr_units: List[BCCRUnit]
    compliance_unit_cap_limit: Optional[Decimal] = None
    compliance_unit_cap_remaining: Optional[Decimal] = None


@dataclass
class BCCRAccountResponseDetails:
    """Data model for BC Carbon Registry account details"""

    entity_id: str
    organization_classification_id: str
    type_of_account_holder: Optional[str]
    trading_name: str


@dataclass
class BCCRComplianceAccountResponseDetails:
    """Data model for BC Carbon Registry compliance account"""

    master_account_name: Optional[str]
    entity_id: Optional[str]


## Elicensing Dataclasses
@dataclass
class PaymentDataWithFreshnessFlag:
    data_is_fresh: bool
    data: QuerySet[ElicensingPayment]


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
    mixedUnitList: List[MixedUnit]


@dataclass
class ObligationData:
    """Data model for essential obligation information without payments"""

    reporting_year: int
    outstanding_balance: Decimal
    equivalent_value: Decimal
    obligation_id: str
    penalty_status: str
    fee_amount_dollars: Optional[Decimal]
    data_is_fresh: bool


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
    billing_items: List[dict]
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

    bccr_trading_name: Optional[str] = None  # Only required for industry users - we enforce this in the service layer
    bccr_holding_account_id: Optional[
        str
    ] = None  # Only required for industry users - we enforce this in the service layer
    analyst_suggestion: Optional[
        Literal["Ready to approve", "Requiring change of BCCR Holding Account ID", "Requiring supplementary report"]
    ] = None
    analyst_comment: Optional[str] = None
    director_comment: Optional[str] = None
    director_decision: Optional[Literal["Approved", "Declined"]] = None


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
    Immutable, normalized contract consumed by `DecreasedObligationHandle._process_adjustment_after_commit(...)`
    - invoices : List[InvoiceAdjustment]: the invoice-level adjustments to apply.
    - earned_tonnes_creditable: The quantity of credits (in tonnes) that are a direct result of over-compliance 
      or credited emissions.
    - earned_tonnes_refundable: The quantity of credits (in tonnes, calculated from the remaining refund pool 
      at the charge rate) that signifies a **cash refund owed** to the entity *after* all outstanding invoices 
      have been cleared.
    - should_record_earned_tonnes: A flag indicating whether the entity has an outcome that should be captured for manual handling
    """

    invoices: List["InvoiceAdjustment"] = field(default_factory=list)
    earned_tonnes_creditable: Decimal = Decimal("0.0000")
    earned_tonnes_refundable: Decimal = Decimal("0.0000")
    should_record_earned_tonnes: bool = False

    @staticmethod
    def empty() -> "AdjustmentStrategy":
        return AdjustmentStrategy()
