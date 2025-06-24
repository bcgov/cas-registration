from datetime import datetime
from typing import Optional, List, Literal
from dataclasses import dataclass, field
from decimal import Decimal


@dataclass
class ClientResponse:
    """Type definition for the client response from eLicensing API"""

    clientObjectId: str
    clientGUID: str
    companyName: str
    lastName: Optional[str] = None
    doingBusinessAs: Optional[str] = None
    firstName: Optional[str] = None
    middleName: Optional[str] = None
    title: Optional[str] = None
    businessPhone: Optional[str] = None
    homeNumber: Optional[str] = None
    cellularNumber: Optional[str] = None
    faxNumber: Optional[str] = None
    businessPhoneExt: Optional[str] = None
    bcCompanyRegistrationNumber: Optional[str] = None
    bcCompanySocietyNumber: Optional[str] = None
    email: Optional[str] = None
    dateOfBirth: Optional[str] = None
    addressLine1: str = ""
    addressLine2: Optional[str] = None
    city: str = ""
    stateProvince: str = ""
    postalCode: str = ""
    country: Optional[str] = None


@dataclass
class ClientCreationResponse:
    """Type definition for the client creation response from eLicensing API"""

    clientObjectId: str
    clientGUID: str


@dataclass
class ClientCreationRequest:
    """Type definition for the client creation request to eLicensing API"""

    companyName: str
    addressLine1: str
    city: str
    stateProvince: str
    postalCode: str
    clientGUID: str
    businessAreaCode: str
    businessPhone: str
    lastName: Optional[str] = None
    doingBusinessAs: Optional[str] = None
    firstName: Optional[str] = None
    middleName: Optional[str] = None
    title: Optional[str] = None
    homeNumber: Optional[str] = None
    cellularNumber: Optional[str] = None
    faxNumber: Optional[str] = None
    businessPhoneExt: Optional[str] = None
    bcCompanyRegistrationNumber: Optional[str] = None
    bcCompanySocietyNumber: Optional[str] = None
    email: Optional[str] = None
    dateOfBirth: Optional[str] = None
    addressLine2: Optional[str] = None
    country: Optional[str] = None


# Valid fee profile group names in eLicensing
FeeProfileGroupName = Literal["OBPS Compliance Obligation", "OBPS Administrative Penalty"]


@dataclass
class FeeCreationItem:
    """Type definition for a fee item in the fee creation request"""

    businessAreaCode: str
    feeGUID: str
    feeProfileGroupName: FeeProfileGroupName  # Must be one of the valid profile group names
    feeDescription: str  # Mandatory field
    feeAmount: Decimal
    feeDate: str  # Format: YYYY-MM-DD


@dataclass
class FeeCreationRequest:
    """Type definition for the fee creation request to eLicensing API"""

    fees: List[FeeCreationItem]


@dataclass
class FeeItem:
    """Type definition for a fee item in the eLicensing API response"""

    feeGUID: str
    feeObjectId: str
    businessAreaCode: Optional[str] = None
    feeProfileGroupName: Optional[str] = None
    feeDescription: Optional[str] = None
    feeAmount: Optional[Decimal] = None
    feeDate: Optional[str] = None


@dataclass
class FeeResponse:
    """Type definition for the fee creation response from eLicensing API"""

    clientObjectId: str
    clientGUID: str
    fees: List[FeeItem]


@dataclass
class InvoiceResponse:
    clientObjectId: str
    businessAreaCode: str
    clientGUID: str
    invoiceNumber: str


@dataclass
class InvoiceCreationRequest:
    paymentDueDate: str
    businessAreaCode: str
    fees: List[str]


@dataclass
class PaymentDistribution:
    distributionObjectId: str
    description: str
    transactionDate: str
    method: str
    reason: str
    amount: Decimal
    taxAmount: Decimal


@dataclass
class Payment:
    paymentObjectId: str
    receiptNumber: str
    receivedDate: str
    depositDate: str
    amount: Decimal
    method: str
    cashHandlingArea: str
    referenceNumber: str
    onlineOrderNumber: Optional[str] = None
    onlineTransactionId: Optional[str] = None
    onlineApprovalCode: Optional[str] = None
    distributions: List[PaymentDistribution] = field(default_factory=list)


@dataclass
class FeeAdjustment:
    adjustmentObjectId: str
    adjustmentTotal: Decimal
    amount: Decimal
    date: str
    reason: str
    type: str
    adjustmentGUID: Optional[str] = None
    taxAmounts: Optional[Decimal] = None
    comment: Optional[str] = None


@dataclass
class InvoiceFee:
    feeObjectId: str
    feeGUID: str
    businessAreaCode: str
    feeDate: str
    description: str
    baseAmount: Decimal
    taxTotal: Decimal
    adjustmentTotal: Decimal
    taxAdjustmentTotal: Decimal
    paymentBaseAmount: Decimal
    paymentTotal: Decimal
    invoiceNumber: str
    payments: List[Payment] = field(default_factory=list)
    adjustments: List[FeeAdjustment] = field(default_factory=list)


@dataclass
class InvoiceQueryResponse:
    clientObjectId: str
    clientGUID: str
    invoiceNumber: str
    invoicePaymentDueDate: str
    invoiceOutstandingBalance: Decimal
    invoiceFeeBalance: Decimal
    invoiceInterestBalance: Decimal
    fees: List[InvoiceFee]


@dataclass
class InvoiceGetResponse:
    """Schema to return invoice details from ElicensingDataRefreshService"""

    invoiceNumber: str
    invoicePaymentDueDate: datetime
    invoiceOutstandingBalance: Decimal
    invoiceFeeBalance: Decimal | None
    invoiceInterestBalance: Decimal | None


@dataclass
class PaymentRecord:
    """Internal schema for payment records from eLicensing"""

    id: str
    paymentReceivedDate: str
    paymentAmountApplied: Decimal
    paymentMethod: str
    transactionType: str
    referenceNumber: str
    receiptNumber: str
