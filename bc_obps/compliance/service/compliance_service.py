from uuid import UUID
from django.db import transaction
from decimal import Decimal
from reporting.models import ReportVersion, ReportProduct
from reporting.service.compliance_service import ComplianceService as ReportComplianceService
from compliance.models import ComplianceSummary, ComplianceProduct, ComplianceObligation, CompliancePeriod
from datetime import date


class ComplianceService:
    """Service for managing compliance summaries and obligations"""

    @classmethod
    def get_or_create_compliance_period(cls, reporting_year: int) -> CompliancePeriod:
        """Gets or creates a compliance period for a reporting year"""
        try:
            return CompliancePeriod.objects.get(id=reporting_year)
        except CompliancePeriod.DoesNotExist:
            # Create compliance period for the reporting year
            start_date = date(reporting_year, 1, 1)
            end_date = date(reporting_year, 12, 31)
            compliance_deadline = date(reporting_year + 1, 6, 30)

            return CompliancePeriod.objects.create(
                id=reporting_year, start_date=start_date, end_date=end_date, compliance_deadline=compliance_deadline
            )

    @classmethod
    def create_compliance_summary(cls, report_version_id: int, user_guid: UUID) -> ComplianceSummary:
        """Creates a compliance summary for a submitted report version"""
        with transaction.atomic():
            report_version = ReportVersion.objects.select_related('report').get(id=report_version_id)

            # Get or create compliance period
            compliance_period = cls.get_or_create_compliance_period(report_version.report.reporting_year_id)

            # Get compliance data from reporting service
            compliance_data = ReportComplianceService.get_calculated_compliance_data(report_version_id)

            # Determine compliance status
            compliance_status = cls._determine_compliance_status(
                compliance_data.excess_emissions, compliance_data.credited_emissions
            )

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
                compliance_status=compliance_status,
            )

            # Get all report products for this version
            report_products = {
                rp.product.name: rp
                for rp in ReportProduct.objects.select_related('product').filter(report_version_id=report_version_id)
            }

            # Create compliance products
            for product_data in compliance_data.products:
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

            # Create compliance obligation if there are excess emissions
            if compliance_data.excess_emissions > Decimal('0'):
                ComplianceObligation.objects.create(
                    compliance_summary=summary,
                    amount=compliance_data.excess_emissions,
                    status=ComplianceObligation.ObligationStatus.PENDING,
                    penalty_status=ComplianceObligation.PenaltyStatus.PENDING,
                )

            return summary

    @staticmethod
    def _determine_compliance_status(excess_emissions: Decimal, credited_emissions: Decimal) -> str:
        """Determines the compliance status based on emissions"""
        if excess_emissions > Decimal('0'):
            return ComplianceSummary.ComplianceStatus.PARTIALLY_MET
        elif credited_emissions > Decimal('0'):
            return ComplianceSummary.ComplianceStatus.EARNED_CREDITS
        else:
            return ComplianceSummary.ComplianceStatus.FULLY_MET
