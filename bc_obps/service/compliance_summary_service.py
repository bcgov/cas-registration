from uuid import UUID
from django.db import transaction
from decimal import Decimal
from compliance.models.compliance_period import CompliancePeriod
from reporting.models import ReportVersion, ReportProduct
from reporting.service.compliance_service import ComplianceService as ReportComplianceService
from compliance.models import ComplianceSummary, ComplianceProduct
from service.compliance_period_service import CompliancePeriodService
from service.compliance_obligation_service import ComplianceObligationService
from django.core.exceptions import ValidationError


class ComplianceSummaryService:
    """
    Service for managing compliance summaries
    """

    @classmethod
    def create_compliance_summary(cls, report_version_id: int, user_guid: UUID) -> ComplianceSummary:
        """
        Creates a compliance summary for a submitted report version

        Args:
            report_version_id (int): The ID of the report version
            user_guid (UUID): The UUID of the user creating the summary

        Returns:
            ComplianceSummary: The created compliance summary
        """
        with transaction.atomic():
            report_version = ReportVersion.objects.select_related('report').get(id=report_version_id)

            # Get compliance period
            try:
                compliance_period = CompliancePeriodService.get_compliance_period_for_year(
                    report_version.report.reporting_year_id
                )
            except CompliancePeriod.DoesNotExist:
                raise ValidationError(
                    f"No compliance period exists for reporting year {report_version.report.reporting_year_id}"
                )

            # Get compliance data from reporting service
            compliance_data = ReportComplianceService.get_calculated_compliance_data(report_version_id)

            # Create compliance summary
            summary = ComplianceSummary.objects.create(
                report=report_version.report,
                current_report_version=report_version,
                compliance_period=compliance_period,
                emissions_attributable_for_reporting=compliance_data.emissions_attributable_for_reporting,
                reporting_only_emissions=compliance_data.reporting_only_emissions,
                emissions_attributable_for_compliance=compliance_data.emissions_attributable_for_compliance,
                emission_limit=compliance_data.emissions_limit,
                excess_emissions=compliance_data.excess_emissions,
                credited_emissions=compliance_data.credited_emissions,
                reduction_factor=compliance_data.regulatory_values.reduction_factor,
                tightening_rate=compliance_data.regulatory_values.tightening_rate,
            )

            # Create compliance products
            cls._create_compliance_products(summary, report_version_id, compliance_data.products)

            # Create compliance obligation if there are excess emissions
            if compliance_data.excess_emissions > Decimal('0'):
                ComplianceObligationService.create_compliance_obligation(
                    summary.id, compliance_data.excess_emissions, report_version
                )

            return summary

    @classmethod
    def _create_compliance_products(
        cls, summary: ComplianceSummary, report_version_id: int, product_data_list: list
    ) -> None:
        """
        Creates compliance products for a compliance summary

        Args:
            summary (ComplianceSummary): The compliance summary
            report_version_id (int): The ID of the report version
            product_data_list (list): List of product data from compliance calculation
        """
        # Get all report products for this version
        report_products = {
            rp.product.name: rp
            for rp in ReportProduct.objects.select_related('product').filter(report_version_id=report_version_id)
        }

        # Create compliance products
        for product_data in product_data_list:
            report_product = report_products[product_data.name]
            ComplianceProduct.objects.create(
                compliance_summary=summary,
                report_product=report_product,
                annual_production=product_data.annual_production,
                apr_dec_production=product_data.apr_dec_production,
                emission_intensity=product_data.emission_intensity,
                allocated_industrial_process_emissions=product_data.allocated_industrial_process_emissions,
                allocated_compliance_emissions=product_data.allocated_compliance_emissions,
            )

    @classmethod
    def get_compliance_summary(cls, summary_id: int) -> ComplianceSummary:
        """
        Gets a compliance summary by ID

        Args:
            summary_id (int): The ID of the compliance summary

        Returns:
            ComplianceSummary: The compliance summary

        Raises:
            ComplianceSummary.DoesNotExist: If the compliance summary doesn't exist
        """
        return ComplianceSummary.objects.get(id=summary_id)

    @staticmethod
    def _determine_compliance_status(excess_emissions: Decimal, credited_emissions: Decimal) -> str:
        """
        Determines the compliance status based on emissions

        Args:
            excess_emissions (Decimal): The excess emissions
            credited_emissions (Decimal): The credited emissions

        Returns:
            str: The compliance status
        """
        if excess_emissions > Decimal('0'):
            return ComplianceSummary.ComplianceStatus.OBLIGATION_NOT_MET
        elif credited_emissions > Decimal('0'):
            return ComplianceSummary.ComplianceStatus.EARNED_CREDITS
        else:
            return ComplianceSummary.ComplianceStatus.OBLIGATION_FULLY_MET

    @staticmethod
    def calculate_outstanding_balance(compliance_summary: ComplianceSummary) -> Decimal:
        """
        Calculates the outstanding balance for a compliance summary.
        The balance is equal to excess emissions if excess emissions are greater than 0,
        and 0 otherwise.

        Args:
            compliance_summary (ComplianceSummary): The compliance summary

        Returns:
            Decimal: The outstanding balance
        """

        # Start with the base outstanding balance (excess emissions if positive, otherwise 0)
        if compliance_summary.excess_emissions > Decimal('0'):
            outstanding_balance = compliance_summary.excess_emissions
        else:
            outstanding_balance = Decimal('0')

        # Future extension points:
        # 1. Incorporate monetary payments into the calculation
        # monetary_payments = _get_monetary_payments(compliance_summary)
        # outstanding_balance = calculate_with_monetary_payments(outstanding_balance, monetary_payments)

        # 2. Incorporate compliance credits into the calculation
        # compliance_credits = _get_compliance_credits(compliance_summary)
        # outstanding_balance = calculate_with_compliance_credits(outstanding_balance, compliance_credits)

        return outstanding_balance
