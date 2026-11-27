from dataclasses import dataclass, field
from decimal import Decimal
from typing import List, Literal, Optional


@dataclass
class ClientResponse:
    """Type definition for the client response from eLicensing API"""

    clientObjectId: str
    clientGUID: str
    companyName: str
    lastName: str | None = None
    doingBusinessAs: str | None = None
    firstName: str | None = None
    middleName: str | None = None
    title: str | None = None
    businessPhone: str | None = None
    homeNumber: str | None = None
    cellularNumber: str | None = None
    faxNumber: str | None = None
    businessPhoneExt: str | None = None
    bcCompanyRegistrationNumber: str | None = None
    bcCompanySocietyNumber: str | None = None
    email: str | None = None
    dateOfBirth: str | None = None
    addressLine1: str = ""
    addressLine2: str | None = None
    city: str = ""
    stateProvince: str = ""
    postalCode: str = ""
    country: str | None = None


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
    lastName: str | None = None
    doingBusinessAs: str | None = None
    firstName: str | None = None
    middleName: str | None = None
    title: str | None = None
    homeNumber: str | None = None
    cellularNumber: str | None = None
    faxNumber: str | None = None
    businessPhoneExt: str | None = None
    bcCompanyRegistrationNumber: str | None = None
    bcCompanySocietyNumber: str | None = None
    email: str | None = None
    dateOfBirth: str | None = None
    addressLine2: str | None = None
    country: str | None = None


# Valid fee profile group names in eLicensing
FeeProfileGroupName = Literal[
    "OBPS Compliance Obligation", "OBPS Administrative Penalty"
]


@dataclass
class FeeCreationItem:
    """Type definition for a fee item in the fee creation request"""

    businessAreaCode: str
    feeGUID: str
    feeProfileGroupName: (
        FeeProfileGroupName  # Must be one of the valid profile group names
    )
    feeDescription: str  # Mandatory field
    feeAmount: Decimal
    feeDate: str  # Format: YYYY-MM-DD


@dataclass
class FeeCreationRequest:
    """Type definition for the fee creation request to eLicensing API"""

    fees: list[FeeCreationItem]


@dataclass
class FeeItem:
    """Type definition for a fee item in the eLicensing API response"""

    feeGUID: str
    feeObjectId: str
    businessAreaCode: str | None = None
    feeProfileGroupName: str | None = None
    feeDescription: str | None = None
    feeAmount: Decimal | None = None
    feeDate: str | None = None
    feeType: str | None = None


@dataclass
class FeeResponse:
    """Type definition for the fee creation response from eLicensing API"""

    clientObjectId: str
    clientGUID: str
    fees: list[FeeItem]


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
    fees: list[str]


@dataclass
class PaymentDistribution:
    distributionObjectId: str
    description: str
    transactionDate: str
    method: str
    reason: str
    amount: Decimal
    taxAmount: Decimal
    distributionType: str | None = None
    reversedDistributionObjectId: str | None = None
    invoiceNumber: str | None = None
    reversedAmount: Decimal | None = None
    feeObjectId: str | None = None


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
    onlineOrderNumber: str | None = None
    onlineTransactionId: str | None = None
    onlineApprovalCode: str | None = None
    distributions: list[PaymentDistribution] = field(default_factory=list)
    adjustmentAmount: Decimal | None = None


@dataclass
class FeeAdjustment:
    adjustmentObjectId: str
    adjustmentTotal: Decimal
    amount: Decimal
    date: str
    reason: str
    type: str
    adjustmentGUID: str | None = None
    taxAmounts: Decimal | None = None
    comment: str | None = None


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
    feeType: Literal["Regular", "Interest"]
    payments: list[Payment] = field(default_factory=list)
    adjustments: list[FeeAdjustment] = field(default_factory=list)


@dataclass
class InvoiceQueryResponse:
    clientObjectId: str
    clientGUID: str
    invoiceNumber: str
    invoicePaymentDueDate: str
    invoiceOutstandingBalance: Decimal
    invoiceFeeBalance: Decimal
    invoiceInterestBalance: Decimal
    fees: list[InvoiceFee]


@dataclass
class InterestRatePeriod:
    """Interest rate period from eLicensing API"""

    rate: Decimal
    startDate: str  # Format: YYYY-MM-DD


@dataclass
class InterestRateResponse:
    """Interest rate response from eLicensing API"""

    daysPerYear: Decimal
    periods: list[InterestRatePeriod]
