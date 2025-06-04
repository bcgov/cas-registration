from uuid import UUID
from compliance.models.elicensing_link import ELicensingLink
from compliance.service.elicensing.elicensing_api_client import ELicensingAPIClient
from compliance.service.compliance_report_version_service import ComplianceReportVersionService
from django.db.models import QuerySet
from compliance.models.compliance_report_version import ComplianceReportVersion
from service.data_access_service.user_service import UserDataAccessService
from service.data_access_service.operation_service import OperationDataAccessService
from registration.models.operation import Operation
from typing import Optional, List, cast, Any, Dict
from compliance.service.elicensing.obligation_elicensing_service import ObligationELicensingService
from compliance.service.elicensing.elicensing_link_service import ELicensingLinkService
from registration.models import Operator
from compliance.models import ComplianceObligation
from dataclasses import dataclass
from decimal import Decimal
from django.core.exceptions import ValidationError
from django.contrib.contenttypes.models import ContentType


@dataclass
class Payment:
    id: str
    paymentReceivedDate: str
    paymentAmountApplied: Decimal
    paymentMethod: str
    transactionType: str
    receiptNumber: str


@dataclass
class PaymentsList:
    rows: List[Payment]
    row_count: int


@dataclass
class PaymentDashboardRow:
    compliance_period: int
    operation_name: str
    payment_towards: str
    invoice_number: str
    payment_amount: Decimal
    outstanding_balance: Decimal


@dataclass
class PaymentsDashboardList:
    rows: List[PaymentDashboardRow]
    row_count: int


class ComplianceDashboardService:
    """
    Service providing data operations for the compliance dashboard
    """

    @classmethod
    def get_compliance_report_versions_for_dashboard(cls, user_guid: UUID) -> QuerySet[ComplianceReportVersion]:
        """
        Fetches all compliance summaries for the user's operations
        """
        user = UserDataAccessService.get_by_guid(user_guid)

        operations = (
            OperationDataAccessService.get_all_operations_for_user(user)
            .filter(status=Operation.Statuses.REGISTERED)
            .values_list('id')
        )

        # Get all compliance report versions for the filtered operations
        compliance_report_versions = ComplianceReportVersion.objects.filter(
            compliance_report__report__operation_id__in=operations
        ).select_related(
            'compliance_report__report__operation',
            'compliance_report__compliance_period',
        )

        # Calculate and attach the outstanding balance to each compliance_report_version
        for version in compliance_report_versions:
            version.outstanding_balance = ComplianceReportVersionService.calculate_outstanding_balance(version)  # type: ignore[attr-defined]

        return compliance_report_versions

    @classmethod
    def get_compliance_report_version_by_id(
        cls, user_guid: UUID, compliance_report_version_id: int
    ) -> Optional[ComplianceReportVersion]:
        """
        Fetches a specific compliance report version by ID if it belongs to one of the user's operations

        Args:
            user_guid: The GUID of the user requesting the compliance_report_version
            compliance_report_version_id: The ID of the compliance compliance_report_version to retrieve

        Returns:
            The requested ComplianceReportVersion object or None if not found
        """
        user = UserDataAccessService.get_by_guid(user_guid)

        # Get all operations the user has access to
        operations = OperationDataAccessService.get_all_operations_for_user(user).filter(
            status=Operation.Statuses.REGISTERED
        )

        # Get the compliance compliance_report_version if it belongs to one of the user's operations
        compliance_report_version = ComplianceReportVersion.objects.select_related(
            'report_compliance_summary__report_version__report',
            'report_compliance_summary__report_version__report__operation',
            'compliance_report__compliance_period',
            'obligation',
        ).get(
            id=compliance_report_version_id, report_compliance_summary__report_version__report__operation__in=operations
        )

        # Calculate and attach the outstanding balance
        if compliance_report_version:
            compliance_report_version.outstanding_balance = ComplianceReportVersionService.calculate_outstanding_balance(compliance_report_version)  # type: ignore[attr-defined]

        return compliance_report_version

    @classmethod
    def get_compliance_report_version_payments(cls, user_guid: UUID, compliance_report_version_id: int) -> PaymentsList:
        """
        Get payments for a compliance report version.

        Args:
            user_guid: The GUID of the user requesting the payments
            compliance_report_version_id: The ID of the compliance report version

        Returns:
            PaymentsList object containing the payment records
        """
        compliance_report_version = cls.get_compliance_report_version_by_id(user_guid, compliance_report_version_id)
        if not compliance_report_version:
            return PaymentsList(rows=[], row_count=0)

        payment_records = ObligationELicensingService.get_obligation_invoice_payments(
            compliance_report_version.obligation.id
        )
        payment_objects = [
            Payment(
                id=record.id,
                paymentReceivedDate=record.paymentReceivedDate,
                paymentAmountApplied=record.paymentAmountApplied,
                paymentMethod=record.paymentMethod,
                transactionType=record.transactionType,
                receiptNumber=record.receiptNumber,
            )
            for record in payment_records
        ]

        return PaymentsList(rows=payment_objects, row_count=len(payment_objects))

    @classmethod
    def get_payments_for_dashboard(cls, operator_id: UUID) -> PaymentsDashboardList:
        """
        Get payments for the payments summaries dashboard

        Args:
            operator_id: The ID of the operator for which payments are being requested

        Returns:
            PaymentsList object containing the payment records
        """

        elicensing_api_client = ELicensingAPIClient()

        client_link = ELicensingLinkService.get_link_for_model(
            model_class=Operator, object_id=operator_id, elicensing_object_kind=ELicensingLink.ObjectKind.CLIENT
        )
        if client_link and client_link.elicensing_object_id:
            client_id = client_link.elicensing_object_id
            fee_response = elicensing_api_client.query_fees(client_object_id=client_id)
            payments = []
            for fee in fee_response['fees']:
                invoice = elicensing_api_client.query_invoice(client_id=client_id, invoice_number=fee['invoiceNumber'])
                linked_fee = ELicensingLink.objects.filter(elicensing_object_id=fee['feeObjectId']).first()
                if linked_fee:
                    if linked_fee.content_type == ContentType.objects.get_for_model(ComplianceObligation):
                        compliance_report = ComplianceObligation.objects.get(
                            id=int(linked_fee.object_id)
                        ).compliance_report_version.compliance_report
                        payment_towards = 'Compliance obligation'
                        for payment in fee['payments']:
                            payment_row = PaymentDashboardRow(
                                compliance_period=compliance_report.report.reporting_year.reporting_year,
                                operation_name=compliance_report.report.operation.name,
                                payment_towards=payment_towards,
                                invoice_number=fee['invoiceNumber'],
                                payment_amount=payment['amount'],
                                outstanding_balance=cast(Dict[str, Any], invoice)['invoiceOutstandingBalance'],
                            )
                            payments.append(payment_row)
        else:
            raise ValidationError("No link for client found")

        return PaymentsDashboardList(rows=payments, row_count=len(payments))
