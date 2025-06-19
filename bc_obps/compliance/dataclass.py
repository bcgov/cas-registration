from decimal import Decimal
from dataclasses import dataclass
from typing import Optional, List
from django.db.models import QuerySet
from compliance.models import ElicensingPayment, ElicensingInvoice


@dataclass
class BCCRUnit:
    """Data model for BC Carbon Registry Unit information"""

    id: Optional[int]
    type: Optional[str]
    serial_number: Optional[str]
    vintage_year: Optional[int]
    quantity_available: Optional[str]


@dataclass
class ComplianceUnitsPageData:
    """Data model for the Apply Compliance Units page data"""

    bccr_trading_name: Optional[str]
    bccr_compliance_account_id: Optional[str]
    charge_rate: Optional[Decimal]
    outstanding_balance: Optional[str]
    bccr_units: List[BCCRUnit]


@dataclass
class BCCRAccountResponseDetails:
    """Data model for BC Carbon Registry account details"""

    entity_id: str
    organization_classification_id: str
    type_of_account_holder: str
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
