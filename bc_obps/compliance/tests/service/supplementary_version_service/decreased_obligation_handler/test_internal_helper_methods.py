from decimal import Decimal
import re

from compliance.models.elicensing_adjustment import ElicensingAdjustment
from compliance.models.elicensing_invoice import ElicensingInvoice
from compliance.models.elicensing_line_item import ElicensingLineItem
from compliance.service.supplementary_version_service.decreased_obligation_handler import DecreasedObligationHandler
from compliance.tests.service.supplementary_version_service.utils import BaseSupplementaryVersionServiceTest
from model_bakery import baker
import pytest


class TestInternalHelpers(BaseSupplementaryVersionServiceTest):

    def test_helper__find_newest_non_void_prior_invoices(
        self,
    ):
        """
        Tests if helper function correctly walks backwards through report versions finding nearest valid invoice past voided ones
        """
        # Arrange
        self.invoice_1 = baker.make_recipe(
            'compliance.tests.utils.elicensing_invoice',
        )
        self.invoice_2 = baker.make_recipe(
            'compliance.tests.utils.elicensing_invoice',
        )
        self.invoice_3 = baker.make_recipe(
            'compliance.tests.utils.elicensing_invoice',
            is_void=True,
        )
        self.invoice_4 = baker.make_recipe(
            'compliance.tests.utils.elicensing_invoice',
            is_void=True,
        )

        self.line_item_1 = baker.make_recipe(
            'compliance.tests.utils.elicensing_line_item',
            elicensing_invoice=self.invoice_1,
        )
        self.line_item_2 = baker.make_recipe(
            'compliance.tests.utils.elicensing_line_item',
            elicensing_invoice=self.invoice_2,
        )
        self.line_item_3 = baker.make_recipe(
            'compliance.tests.utils.elicensing_line_item',
            elicensing_invoice=self.invoice_3,
        )
        self.line_item_4 = baker.make_recipe(
            'compliance.tests.utils.elicensing_line_item',
            elicensing_invoice=self.invoice_4,
        )

        self.payment_1 = baker.make_recipe(
            'compliance.tests.utils.elicensing_payment',
            elicensing_line_item=self.line_item_1,
            amount=Decimal('100.01'),
        )
        self.payment_2 = baker.make_recipe(
            'compliance.tests.utils.elicensing_payment',
            elicensing_line_item=self.line_item_2,
            amount=Decimal('100.01'),
        )

        self.crv_1 = baker.make_recipe(
            'compliance.tests.utils.compliance_report_version',
        )
        self.crv_2 = baker.make_recipe(
            'compliance.tests.utils.compliance_report_version',
            previous_version=self.crv_1,
        )
        self.crv_3 = baker.make_recipe(
            'compliance.tests.utils.compliance_report_version',
            previous_version=self.crv_2,
        )
        self.crv_4 = baker.make_recipe(
            'compliance.tests.utils.compliance_report_version',
            previous_version=self.crv_3,
        )
        self.crv_5 = baker.make_recipe(
            'compliance.tests.utils.compliance_report_version',
            previous_version=self.crv_4,
        )

        self.obligation_1 = baker.make_recipe(
            'compliance.tests.utils.compliance_obligation',
            elicensing_invoice=self.invoice_1,
            compliance_report_version=self.crv_1,
        )
        self.obligation_2 = baker.make_recipe(
            'compliance.tests.utils.compliance_obligation',
            elicensing_invoice=self.invoice_2,
            compliance_report_version=self.crv_2,
        )
        self.obligation_3 = baker.make_recipe(
            'compliance.tests.utils.compliance_obligation',
            elicensing_invoice=self.invoice_3,
            compliance_report_version=self.crv_3,
        )
        self.obligation_4 = baker.make_recipe(
            'compliance.tests.utils.compliance_obligation',
            elicensing_invoice=self.invoice_4,
            compliance_report_version=self.crv_4,
        )

        # Act
        result = DecreasedObligationHandler._find_newest_non_void_prior_invoices(
            self.crv_5.id, ElicensingInvoice.objects.none()
        )

        # Assert
        assert result.first() == self.invoice_2

    def test_sum_already_applied_supplementary_adjustments_since_anchor_raises_if_positive_decrease(self):
        initial_compliance_report_version = baker.make_recipe("compliance.tests.utils.compliance_report_version")
        suppl_compliance_report_version = baker.make_recipe(
            "compliance.tests.utils.compliance_report_version",
            is_supplementary=True,
            compliance_report=initial_compliance_report_version.compliance_report,
        )
        adjustment_record = baker.make_recipe(
            "compliance.tests.utils.elicensing_adjustment",
            amount=Decimal("123.00"),
            supplementary_compliance_report_version=suppl_compliance_report_version,
            reason=ElicensingAdjustment.Reason.SUPPLEMENTARY_REPORT_ADJUSTMENT,
        )

        with pytest.raises(
            ValueError,
            match=re.escape(
                'Unexpected positive supplementary adjustment total 123.00 for invoices'
                f' [{adjustment_record.elicensing_line_item.elicensing_invoice.id}] since anchor'
                f' CRV {adjustment_record.supplementary_compliance_report_version.id}'
            ),
        ):
            DecreasedObligationHandler._sum_already_applied_supplementary_adjustments_since_anchor(
                adjustment_record.supplementary_compliance_report_version.id,
                [adjustment_record.elicensing_line_item.elicensing_invoice.id],
            )

    def test_sum_already_applied_supplementary_adjustments_since_anchor(self):

        # Two line items from two different invoices
        # First one meant to be included, second one meant to be excluded
        line_items = baker.make_recipe(
            "compliance.tests.utils.elicensing_line_item",
            line_item_type=ElicensingLineItem.LineItemType.FEE,
            elicensing_invoice=lambda: baker.make_recipe("compliance.tests.utils.elicensing_invoice"),
            _quantity=2,
        )

        assert line_items[0].elicensing_invoice.id != line_items[1].elicensing_invoice.id

        initial_compliance_report_version = baker.make_recipe("compliance.tests.utils.compliance_report_version")
        supplementary_compliance_report_versions = baker.make_recipe(
            "compliance.tests.utils.compliance_report_version",
            is_supplementary=True,
            compliance_report=initial_compliance_report_version.compliance_report,
            _quantity=4,
        )

        # Counted in (from second suppl report version)
        baker.make_recipe(
            "compliance.tests.utils.elicensing_adjustment",
            elicensing_line_item=line_items[0],
            amount=Decimal("-100.00"),
            supplementary_compliance_report_version=supplementary_compliance_report_versions[1],
        )
        baker.make_recipe(
            "compliance.tests.utils.elicensing_adjustment",
            elicensing_line_item=line_items[0],
            amount=Decimal("-1000.00"),
            supplementary_compliance_report_version=supplementary_compliance_report_versions[1],
        )
        baker.make_recipe(
            "compliance.tests.utils.elicensing_adjustment",
            elicensing_line_item=line_items[0],
            amount=Decimal("-10000.00"),
            supplementary_compliance_report_version=supplementary_compliance_report_versions[3],
        )
        baker.make_recipe(
            "compliance.tests.utils.elicensing_adjustment",
            elicensing_line_item=line_items[0],
            amount=Decimal("-100000.00"),
            supplementary_compliance_report_version=supplementary_compliance_report_versions[3],
            reason="Some arbitrary reason",
        )
        baker.make_recipe(
            "compliance.tests.utils.elicensing_adjustment",
            elicensing_line_item=line_items[0],
            amount=Decimal("-1000000.00"),
            supplementary_compliance_report_version=supplementary_compliance_report_versions[3],
            reason=ElicensingAdjustment.Reason.SUPPLEMENTARY_REPORT_ADJUSTMENT,
        )
        # Excluded
        # No suppl compliance report version
        baker.make_recipe(
            "compliance.tests.utils.elicensing_adjustment",
            elicensing_line_item=line_items[0],
            amount=Decimal("-1.00"),
            supplementary_compliance_report_version=None,
        )
        # Too early suppl compliance report version
        baker.make_recipe(
            "compliance.tests.utils.elicensing_adjustment",
            elicensing_line_item=line_items[0],
            amount=Decimal("-2.00"),
            supplementary_compliance_report_version=supplementary_compliance_report_versions[0],
        )
        # Different line item and invoice
        baker.make_recipe(
            "compliance.tests.utils.elicensing_adjustment",
            elicensing_line_item=line_items[1],
            amount=Decimal("-4.00"),
            supplementary_compliance_report_version=supplementary_compliance_report_versions[1],
        )
        # Excluded because reason is COMPLIANCE_UNITS_APPLIED
        baker.make_recipe(
            "compliance.tests.utils.elicensing_adjustment",
            elicensing_line_item=line_items[0],
            amount=Decimal("-8.00"),
            supplementary_compliance_report_version=supplementary_compliance_report_versions[3],
            reason=ElicensingAdjustment.Reason.COMPLIANCE_UNITS_APPLIED,
        )

        already_applied = DecreasedObligationHandler._sum_already_applied_supplementary_adjustments_since_anchor(
            supplementary_compliance_report_versions[1].id,
            [line_items[0].elicensing_invoice.id],
        )

        assert already_applied == Decimal('1111100.00')
