from datetime import date
from decimal import Decimal

from model_bakery.baker import make_recipe
import pytest

from compliance.models import (
    CompliancePenalty,
    ComplianceReportVersion,
    ElicensingInvoice,
    ElicensingLineItem,
)
from compliance.service.elicensing.elicensing_invoice_service import ElicensingInvoiceService
from compliance.tests.service.test_compliance_dashboard_service import _NoopFilters
from compliance.tests.utils.compliance_test_helper import ComplianceTestHelper
from reporting.service.reporting_year_service import ReportingYearService

pytestmark = pytest.mark.django_db
MOCK_REPORTING_YEAR = date.today().year - 1


class TestElicensingInvoiceService:
    def setup_method(self):
        self.test_data = ComplianceTestHelper.build_test_data(
            reporting_year=ReportingYearService.get_current_reporting_year().reporting_year,
            crv_status=ComplianceReportVersion.ComplianceStatus.OBLIGATION_NOT_MET,
            create_invoice_data=True,
        )
        self.test_data.invoice.due_date = date(2025, 8, 1)
        self.test_data.invoice.save()

        self.test_data.compliance_obligation.fee_amount_dollars = Decimal("300.00")
        self.test_data.compliance_obligation.save()
        # Add payments and adjustments
        make_recipe("compliance.tests.utils.elicensing_payment", elicensing_line_item=self.test_data.fee, amount=201)
        make_recipe("compliance.tests.utils.elicensing_payment", elicensing_line_item=self.test_data.fee, amount=49)
        make_recipe("compliance.tests.utils.elicensing_adjustment", elicensing_line_item=self.test_data.fee, amount=25)
        make_recipe("compliance.tests.utils.elicensing_adjustment", elicensing_line_item=self.test_data.fee, amount=25)

        # Add FAA Interest + payment to the first invoice
        self.faa_line_item = make_recipe(
            "compliance.tests.utils.elicensing_line_item",
            elicensing_invoice=self.test_data.invoice,
            line_item_type=ElicensingLineItem.LineItemType.INTEREST,
            base_amount=Decimal("20.00"),
            fee_date=date(2025, 1, 26),
            description="Interest to Payment Received Date",
        )

        # Add automatic overdue penalty
        self.penalty_invoice = make_recipe("compliance.tests.utils.elicensing_invoice", due_date=date(2025, 8, 1))
        make_recipe(
            "compliance.tests.utils.compliance_penalty",
            compliance_obligation=self.test_data.compliance_obligation,
            elicensing_invoice=self.penalty_invoice,
            penalty_type=CompliancePenalty.PenaltyType.AUTOMATIC_OVERDUE,
        )

        # Add late submission penalty using a separate invoice
        self.late_penalty_invoice = make_recipe("compliance.tests.utils.elicensing_invoice", due_date=date(2025, 8, 1))
        make_recipe(
            "compliance.tests.utils.compliance_penalty",
            compliance_obligation=self.test_data.compliance_obligation,
            elicensing_invoice=self.late_penalty_invoice,
            penalty_type=CompliancePenalty.PenaltyType.LATE_SUBMISSION,
        )

    def test_get_elicensing_invoice_for_dashboard_for_irc_user(
        self,
    ):
        self.test_data.fee.base_amount = Decimal("300.00")
        self.test_data.fee.save()
        # additional report for current year
        test_data_2 = ComplianceTestHelper.build_test_data(
            reporting_year=MOCK_REPORTING_YEAR,
            crv_status=ComplianceReportVersion.ComplianceStatus.OBLIGATION_NOT_MET,
            create_invoice_data=True,
        )
        test_data_2.compliance_obligation.fee_amount_dollars = Decimal("400.00")
        test_data_2.compliance_obligation.save()

        # additional report for different year - should not be included
        test_data_3 = ComplianceTestHelper.build_test_data(
            reporting_year=2023,
            crv_status=ComplianceReportVersion.ComplianceStatus.OBLIGATION_NOT_MET,
            create_invoice_data=True,
        )
        test_data_3.compliance_obligation.fee_amount_dollars = Decimal("450.00")
        test_data_3.compliance_obligation.save()

        cas_analyst = make_recipe("registration.tests.utils.cas_analyst")

        result = ElicensingInvoiceService.get_elicensing_invoice_for_dashboard(
            cas_analyst.user_guid, sort_field="id", sort_order="asc", filters=_NoopFilters()
        )
        assert (
            result.count() == ElicensingInvoice.objects.count()
        )  # cas users should see all invoices, 3 from setup (obligation + 2 penalty invoices) + 2 from this test

        assert list(result.values_list("invoice_type", flat=True)) == [
            "obligation",
            "automatic overdue penalty",
            "late submission penalty",
            "obligation",
            "obligation",
        ]
        # spot-checking the details
        assert result[0].invoice_type == "obligation"
        assert result[0].invoice_total == 300
        assert result[0].faa_interest_total == 0
        assert result[0].total_payments == 250  # 201 + 49
        assert result[0].total_adjustments == 50  # 25 + 25

    def test_get_elicensing_invoice_for_dashboard_for_industry_user(self):
        # invoice belonging to operator
        test_data_2 = ComplianceTestHelper.build_test_data(
            reporting_year=MOCK_REPORTING_YEAR,
            crv_status=ComplianceReportVersion.ComplianceStatus.OBLIGATION_NOT_MET,
            create_invoice_data=True,
        )
        test_data_2.fee.base_amount = Decimal("500.00")
        test_data_2.fee.save()

        approved_user_operator = make_recipe(
            'registration.tests.utils.approved_user_operator', operator=test_data_2.operation.operator
        )

        # Add payments and adjustments
        make_recipe("compliance.tests.utils.elicensing_payment", elicensing_line_item=test_data_2.fee, amount=201)
        make_recipe("compliance.tests.utils.elicensing_payment", elicensing_line_item=test_data_2.fee, amount=49)
        make_recipe("compliance.tests.utils.elicensing_adjustment", elicensing_line_item=test_data_2.fee, amount=25)
        make_recipe("compliance.tests.utils.elicensing_adjustment", elicensing_line_item=test_data_2.fee, amount=25)

        # Add FAA Interest + payment
        faa_line_item = make_recipe(
            "compliance.tests.utils.elicensing_line_item",
            elicensing_invoice=test_data_2.invoice,
            line_item_type=ElicensingLineItem.LineItemType.INTEREST,
            base_amount=Decimal("100.00"),
            fee_date=date(2025, 1, 26),
            description="Interest to Payment Received Date",
        )
        make_recipe(
            "compliance.tests.utils.elicensing_payment",
            elicensing_line_item=faa_line_item,
            amount=Decimal("15.00"),
        )

        assert (
            ElicensingInvoice.objects.count() == 4
        )  # 3 from setup (obligation + 2 penalty invoices) + 1 from this test

        result = ElicensingInvoiceService.get_elicensing_invoice_for_dashboard(
            approved_user_operator.user.user_guid, sort_field="id", sort_order="asc", filters=_NoopFilters()
        )
        assert result.count() == 1

        assert result[0].invoice_type == "obligation"
        assert result[0].invoice_total == 500
        assert result[0].faa_interest_total == 0
        assert result[0].total_payments == 265  # 201 + 49 + 15
        assert result[0].total_adjustments == 50  # 25 + 25
