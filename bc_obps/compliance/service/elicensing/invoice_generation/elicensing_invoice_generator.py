from decimal import Decimal
import json
from typing import Any, Dict, Generator, Tuple
from django.http import StreamingHttpResponse

from compliance.enums import ComplianceInvoiceTypes
from compliance.models.compliance_penalty import CompliancePenalty
from common.service.pdf.pdf_generator_service import PDFGeneratorService
from compliance.dataclass import AutomaticOverduePenaltyInvoiceContext, ObligationInvoiceContext
from compliance.models.compliance_charge_rate import ComplianceChargeRate
from compliance.models.compliance_obligation import ComplianceObligation
from compliance.models.compliance_report_version import ComplianceReportVersion
from compliance.service.compliance_report_version_service import ComplianceReportVersionService
from compliance.service.elicensing.elicensing_data_refresh_service import ElicensingDataRefreshService
from compliance.service.elicensing.invoice_generation.elicensing_invoice_context import ElicensingInvoiceContextService
from compliance.service.exceptions import ComplianceInvoiceError
from reporting.models.report_compliance_summary import ReportComplianceSummary

"""
Elicensing_invoice_generator

Functions for creating PDFs for different types of invoices, and logic to stream
a generic PDF response.
"""


class ElicensingInvoiceGeneratorService:
    @classmethod
    def create_pdf_response(
        cls, pdf: Tuple[Generator[bytes, None, None], str, int] | Dict[str, Any]
    ) -> StreamingHttpResponse:
        # If result is an error dictionary, stream it back with status 400
        if isinstance(pdf, dict) and "errors" in pdf:
            err_payload = json.dumps({"errors": pdf["errors"]}).encode("utf-8")
            return StreamingHttpResponse(
                streaming_content=iter([err_payload]),
                content_type="application/json",
                status=400,
            )
        # Otherwise, unpack the PDF generator, filename, and total size
        pdf_generator, filename, total_size = pdf
        response = StreamingHttpResponse(streaming_content=pdf_generator, content_type="application/pdf")
        response["Content-Disposition"] = f'attachment; filename="{filename}"'
        response["Content-Length"] = str(total_size)
        return response

    @classmethod
    def generate_obligation_invoice_pdf(
        cls,
        compliance_report_version_id: int,
    ) -> Tuple[Generator[bytes, None, None], str, int] | Dict[str, Any]:
        """
        Generates a PDF invoice for compliance obligation.
        Args:
            compliance_report_version_id: ID of the compliance report version.
        Returns:
            - On success: Tuple (PDF generator, filename, total_size_in_bytes).
            - On error: Custom ComplianceInvoiceError
        """
        try:
            # Refresh the BCIERS data from Elicensing API
            refresh_result = ElicensingDataRefreshService.refresh_data_wrapper_by_compliance_report_version_id(
                compliance_report_version_id=compliance_report_version_id
            )
            # Format RefreshWrapperReturn metadata
            last_refresh_metadata = ElicensingDataRefreshService.get_last_refreshed_metadata(refresh_result)
            # Get compliance obligation information
            # compliance_report_version_id  → ComplianceObligation
            compliance_obligation: ComplianceObligation = (
                ComplianceReportVersionService.get_obligation_by_compliance_report_version(compliance_report_version_id)
            )
            compliance_report_version: ComplianceReportVersion = compliance_obligation.compliance_report_version
            # Get invoice data
            invoice = refresh_result.invoice
            invoice_is_void = (
                invoice.is_void
                and compliance_report_version.status == ComplianceReportVersion.ComplianceStatus.OBLIGATION_FULLY_MET
            )
            partial_context = ElicensingInvoiceContextService.prepare_partial_invoice_context(
                compliance_report_version_id, invoice, compliance_obligation.obligation_id
            )
            invoice_date = (
                compliance_obligation.fee_date.strftime("%b %-d, %Y") if compliance_obligation.fee_date else "—"
            )
            # Get compliance obligation amounts
            # Get fee_amount_dollars (calculated emmissions * charge rate) from
            # ComplianceObligation  → ComplianceReportVersion
            fee_amount_dollars = compliance_obligation.fee_amount_dollars
            # Get excess_emissions from
            # ComplianceReportVersion → ReportComplianceSummary
            report_compliance_summary: ReportComplianceSummary = compliance_report_version.report_compliance_summary
            excess_emissions = report_compliance_summary.excess_emissions
            # Get charge_rate from
            # ComplianceReportVersion → ComplianceReport → CompliancePeriod → ReportingYear → ComplianceChargeRate
            charge_rate_decimal: Decimal = ComplianceChargeRate.objects.get(
                reporting_year=compliance_report_version.compliance_report.compliance_period.reporting_year
            ).rate
            # Format obligation amounts
            compliance_obligation_emissions = f"{excess_emissions} tCO₂e"
            compliance_obligation_charge_rate = f"${charge_rate_decimal:,.2f} / tCO₂e"
            compliance_obligation_fee_amount_dollars = f"${fee_amount_dollars:,.2f}"
            # Get reporting year
            compliance_obligation_year: int = (
                compliance_report_version.compliance_report.compliance_period.reporting_year.reporting_year
            )
            # Assemble context dictionary
            context_obj = ObligationInvoiceContext(
                **partial_context,
                invoice_date=invoice_date,
                invoice_is_void=invoice_is_void,
                compliance_obligation_year=compliance_obligation_year,
                compliance_obligation=compliance_obligation_emissions,
                compliance_obligation_charge_rate=compliance_obligation_charge_rate,
                compliance_obligation_equivalent_amount=compliance_obligation_fee_amount_dollars,
            )
            context = context_obj.__dict__
            # Update the dataclass dict with the refresh metadata
            context.update(last_refresh_metadata)
            # Generate filename
            filename = ElicensingInvoiceContextService.build_invoice_filename(
                "OBPS Compliance Invoice", context['invoice_number']
            )
            # Generate and return the PDF generator, filename, and size
            return PDFGeneratorService.generate_pdf(
                template_name="invoice.html",
                context=context,
                filename=filename,
            )
        except Exception as exc:
            # If it’s already a ComplianceInvoiceError, just re‐raise it.
            if isinstance(exc, ComplianceInvoiceError):
                raise
            # Otherwise wrap in ComplianceInvoiceError and raise
            raise ComplianceInvoiceError("unexpected_error", str(exc))

    @classmethod
    def generate_automatic_overdue_penalty_invoice_pdf(
        cls,
        compliance_report_version_id: int,
    ) -> Tuple[Generator[bytes, None, None], str, int] | Dict[str, Any]:
        """
        Generates a PDF invoice for compliance obligation's automatic penalty.

        Args:
            compliance_report_version_id: ID of the compliance report version.

        Returns:
            - On success: Tuple (PDF generator, filename, total_size_in_bytes).
            - On error: Custom ComplianceInvoiceError
        """
        try:
            # Refresh the BCIERS data from Elicensing API
            penalty_refresh_result = ElicensingDataRefreshService.refresh_data_wrapper_by_compliance_report_version_id(
                compliance_report_version_id=compliance_report_version_id,
                invoice_type=ComplianceInvoiceTypes.AUTOMATIC_OVERDUE_PENALTY,
            )

            # Format RefreshWrapperReturn metadata
            last_refresh_metadata = ElicensingDataRefreshService.get_last_refreshed_metadata(penalty_refresh_result)

            # Get penalty invoice data
            penalty_invoice = penalty_refresh_result.invoice

            # Get compliance obligation information
            # compliance_report_version_id  → ComplianceObligation
            compliance_obligation: ComplianceObligation = (
                ComplianceReportVersionService.get_obligation_by_compliance_report_version(compliance_report_version_id)
            )

            partial_context = ElicensingInvoiceContextService.prepare_partial_invoice_context(
                compliance_report_version_id, penalty_invoice, compliance_obligation.obligation_id
            )

            compliance_penalty = CompliancePenalty.objects.get(
                elicensing_invoice=penalty_invoice,
                penalty_type=CompliancePenalty.PenaltyType.AUTOMATIC_OVERDUE,
            )

            invoice_date = compliance_penalty.fee_date.strftime("%b %-d, %Y") if compliance_penalty.fee_date else "—"

            penalty_invoice_is_void = penalty_invoice.is_void and (
                compliance_obligation.penalty_status == ComplianceObligation.PenaltyStatus.PAID
                or compliance_obligation.penalty_status == ComplianceObligation.PenaltyStatus.NONE
            )

            # Assemble context dictionary
            context_obj = AutomaticOverduePenaltyInvoiceContext(
                **partial_context,
                invoice_is_void=penalty_invoice_is_void,
                invoice_date=invoice_date,
                penalty_amount=f"${compliance_penalty.penalty_amount:,.2f}",
            )

            context = context_obj.__dict__

            # Update the dataclass dict with the refresh metadata
            context.update(last_refresh_metadata)

            # Generate filename
            filename = ElicensingInvoiceContextService.build_invoice_filename(
                "OBPS Automatic Overdue Penalty Invoice", context['invoice_number']
            )

            # Generate and return the PDF generator, filename, and size
            return PDFGeneratorService.generate_pdf(
                template_name="automatic_overdue_penalty_invoice.html",
                context=context,
                filename=filename,
            )

        except Exception as exc:
            # If it’s already a ComplianceInvoiceError, just re‐raise it.
            if isinstance(exc, ComplianceInvoiceError):
                raise

            # Otherwise wrap in ComplianceInvoiceError and raise
            raise ComplianceInvoiceError("unexpected_error", str(exc))

    @classmethod
    def generate_late_submission_penalty_invoice_pdf(
        cls,
        compliance_report_version_id: int,
    ) -> Tuple[Generator[bytes, None, None], str, int] | Dict[str, Any]:
        """Generates a PDF invoice for a compliance obligation's late submission penalty.

        This mirrors generate_automatic_overdue_penalty_invoice_pdf but targets the
        LATE_SUBMISSION_PENALTY invoice type and corresponding CompliancePenalty.
        """
        try:
            penalty_refresh_result = ElicensingDataRefreshService.refresh_data_wrapper_by_compliance_report_version_id(
                compliance_report_version_id=compliance_report_version_id,
                invoice_type=ComplianceInvoiceTypes.LATE_SUBMISSION_PENALTY,
            )

            last_refresh_metadata = ElicensingDataRefreshService.get_last_refreshed_metadata(penalty_refresh_result)

            penalty_invoice = penalty_refresh_result.invoice

            compliance_obligation: ComplianceObligation = (
                ComplianceReportVersionService.get_obligation_by_compliance_report_version(compliance_report_version_id)
            )

            partial_context = ElicensingInvoiceContextService.prepare_partial_invoice_context(
                compliance_report_version_id, penalty_invoice, compliance_obligation.obligation_id
            )

            compliance_penalty = CompliancePenalty.objects.get(
                elicensing_invoice=penalty_invoice,
                penalty_type=CompliancePenalty.PenaltyType.LATE_SUBMISSION,
            )

            invoice_date = compliance_penalty.fee_date.strftime("%b %-d, %Y") if compliance_penalty.fee_date else "—"

            penalty_invoice_is_void = penalty_invoice.is_void and (
                compliance_obligation.penalty_status == ComplianceObligation.PenaltyStatus.PAID
                or compliance_obligation.penalty_status == ComplianceObligation.PenaltyStatus.NONE
            )

            context_obj = AutomaticOverduePenaltyInvoiceContext(
                **partial_context,
                invoice_is_void=penalty_invoice_is_void,
                invoice_date=invoice_date,
                penalty_amount=f"${compliance_penalty.penalty_amount:,.2f}",
            )

            context = context_obj.__dict__
            context.update(last_refresh_metadata)

            filename = ElicensingInvoiceContextService.build_invoice_filename(
                "OBPS GGEAPAR Penalty Invoice", context['invoice_number']
            )

            return PDFGeneratorService.generate_pdf(
                template_name="automatic_overdue_penalty_invoice.html",
                context=context,
                filename=filename,
            )

        except Exception as exc:
            if isinstance(exc, ComplianceInvoiceError):
                raise

            raise ComplianceInvoiceError("unexpected_error", str(exc))
