from common.tests.utils.helpers import BaseTestCase
from compliance.models import ComplianceEarnedCredit
from registration.tests.constants import TIMESTAMP_COMMON_FIELDS
from model_bakery.baker import make_recipe
from django.db import transaction
from django.db.utils import ProgrammingError


class ComplianceEarnedCreditTest(BaseTestCase):
    @classmethod
    def setUpTestData(cls):
        cls.test_object = make_recipe(
            "compliance.tests.utils.compliance_earned_credit",
            earned_credits_amount=100,
            issuance_status=ComplianceEarnedCredit.IssuanceStatus.CREDITS_NOT_ISSUED,
        )
        cls.field_data = [
            *TIMESTAMP_COMMON_FIELDS,
            ("id", "ID", None, None),
            ("compliance_report_version", "compliance report version", None, None),
            ("earned_credits_amount", "earned credits amount", None, None),
            ("issuance_status", "issuance status", None, None),
            ("issued_date", "issued date", None, None),
            ("issued_by", "issued by", None, None),
            ("bccr_trading_name", "bccr trading name", None, None),
            ("analyst_comment", "analyst comment", None, None),
            ("director_comment", "director comment", None, None),
        ]


class ComplianceEarnedCreditTriggerTest(BaseTestCase):

    def test_create_with_null_bccr_trading_name_and_credits_not_issued_succeeds(self):
        earned_credit = make_recipe(
            "compliance.tests.utils.compliance_earned_credit",
            earned_credits_amount=100,
            issuance_status=ComplianceEarnedCredit.IssuanceStatus.CREDITS_NOT_ISSUED,
            bccr_trading_name=None,
        )
        self.assertIsNone(earned_credit.bccr_trading_name)
        self.assertEqual(earned_credit.issuance_status, ComplianceEarnedCredit.IssuanceStatus.CREDITS_NOT_ISSUED)

    def test_create_with_empty_bccr_trading_name_and_other_status_fails(self):
        with self.assertRaises(ProgrammingError) as cm:
            with transaction.atomic():
                make_recipe(
                    "compliance.tests.utils.compliance_earned_credit",
                    earned_credits_amount=100,
                    issuance_status=ComplianceEarnedCredit.IssuanceStatus.ISSUANCE_REQUESTED,
                    bccr_trading_name="",
                )
        self.assertIn(
            "bccr_trading_name cannot be empty unless issuance_status is \"Credits Not Issued in BCCR\"",
            str(cm.exception),
        )

    def test_create_with_null_bccr_trading_name_and_other_status_fails(self):
        with self.assertRaises(ProgrammingError) as cm:
            with transaction.atomic():
                make_recipe(
                    "compliance.tests.utils.compliance_earned_credit",
                    earned_credits_amount=100,
                    issuance_status=ComplianceEarnedCredit.IssuanceStatus.APPROVED,
                    bccr_trading_name=None,
                )
        self.assertIn(
            "bccr_trading_name cannot be empty unless issuance_status is \"Credits Not Issued in BCCR\"",
            str(cm.exception),
        )

    def test_update_to_empty_bccr_trading_name_with_credits_not_issued_succeeds(self):
        earned_credit = make_recipe(
            "compliance.tests.utils.compliance_earned_credit",
            earned_credits_amount=100,
            issuance_status=ComplianceEarnedCredit.IssuanceStatus.CREDITS_NOT_ISSUED,
            bccr_trading_name="some_trading_name",
        )

        # Update to empty string should succeed
        earned_credit.bccr_trading_name = ""
        earned_credit.save()

        earned_credit.refresh_from_db()
        self.assertEqual(earned_credit.bccr_trading_name, "")

    def test_update_to_null_bccr_trading_name_with_credits_not_issued_succeeds(self):
        earned_credit = make_recipe(
            "compliance.tests.utils.compliance_earned_credit",
            earned_credits_amount=100,
            issuance_status=ComplianceEarnedCredit.IssuanceStatus.CREDITS_NOT_ISSUED,
            bccr_trading_name="some_trading_name",
        )

        # Update to null should succeed
        earned_credit.bccr_trading_name = None
        earned_credit.save()

        earned_credit.refresh_from_db()
        self.assertIsNone(earned_credit.bccr_trading_name)

    def test_update_to_empty_bccr_trading_name_with_other_status_fails(self):
        earned_credit = make_recipe(
            "compliance.tests.utils.compliance_earned_credit",
            earned_credits_amount=100,
            issuance_status=ComplianceEarnedCredit.IssuanceStatus.ISSUANCE_REQUESTED,
            bccr_trading_name="some_trading_name",
        )

        # Update to empty string should fail
        earned_credit.bccr_trading_name = ""
        with self.assertRaises(ProgrammingError) as cm:
            with transaction.atomic():
                earned_credit.save()
        self.assertIn(
            "bccr_trading_name cannot be empty unless issuance_status is \"Credits Not Issued in BCCR\"",
            str(cm.exception),
        )

    def test_update_to_null_bccr_trading_name_with_other_status_fails(self):
        earned_credit = make_recipe(
            "compliance.tests.utils.compliance_earned_credit",
            earned_credits_amount=100,
            issuance_status=ComplianceEarnedCredit.IssuanceStatus.APPROVED,
            bccr_trading_name="some_trading_name",
        )

        # Update to null should fail
        earned_credit.bccr_trading_name = None
        with self.assertRaises(ProgrammingError) as cm:
            with transaction.atomic():
                earned_credit.save()
        self.assertIn(
            "bccr_trading_name cannot be empty unless issuance_status is \"Credits Not Issued in BCCR\"",
            str(cm.exception),
        )

    def test_update_issuance_status_with_empty_bccr_trading_name_fails(self):
        earned_credit = make_recipe(
            "compliance.tests.utils.compliance_earned_credit",
            earned_credits_amount=100,
            issuance_status=ComplianceEarnedCredit.IssuanceStatus.CREDITS_NOT_ISSUED,
            bccr_trading_name="",
        )

        # Update status should fail because bccr_trading_name is empty
        earned_credit.issuance_status = ComplianceEarnedCredit.IssuanceStatus.ISSUANCE_REQUESTED
        with self.assertRaises(ProgrammingError) as cm:
            with transaction.atomic():
                earned_credit.save()
        self.assertIn(
            "bccr_trading_name cannot be empty unless issuance_status is \"Credits Not Issued in BCCR\"",
            str(cm.exception),
        )

    def test_update_issuance_status_with_null_bccr_trading_name_fails(self):
        earned_credit = make_recipe(
            "compliance.tests.utils.compliance_earned_credit",
            earned_credits_amount=100,
            issuance_status=ComplianceEarnedCredit.IssuanceStatus.CREDITS_NOT_ISSUED,
            bccr_trading_name=None,
        )

        # Update status should fail because bccr_trading_name is null
        earned_credit.issuance_status = ComplianceEarnedCredit.IssuanceStatus.APPROVED
        with self.assertRaises(ProgrammingError) as cm:
            with transaction.atomic():
                earned_credit.save()
        self.assertIn(
            "bccr_trading_name cannot be empty unless issuance_status is \"Credits Not Issued in BCCR\"",
            str(cm.exception),
        )

    def test_create_with_valid_bccr_trading_name_and_any_status_succeeds(self):
        for status in ComplianceEarnedCredit.IssuanceStatus.choices:
            earned_credit = make_recipe(
                "compliance.tests.utils.compliance_earned_credit",
                earned_credits_amount=100,
                issuance_status=status[0],
                bccr_trading_name="valid_trading_name",
            )
            self.assertEqual(earned_credit.bccr_trading_name, "valid_trading_name")
            self.assertEqual(earned_credit.issuance_status, status[0])

    def test_update_bccr_trading_name_with_valid_value_and_any_status_succeeds(self):
        earned_credit = make_recipe(
            "compliance.tests.utils.compliance_earned_credit",
            earned_credits_amount=100,
            issuance_status=ComplianceEarnedCredit.IssuanceStatus.ISSUANCE_REQUESTED,
            bccr_trading_name="initial_trading_name",
        )

        # Update to valid value should succeed
        earned_credit.bccr_trading_name = "updated_trading_name"
        earned_credit.save()

        earned_credit.refresh_from_db()
        self.assertEqual(earned_credit.bccr_trading_name, "updated_trading_name")

    def test_transition_from_default_status_to_new_status_with_bccr_trading_name_succeeds(self):
        """Test the typical workflow: transition from CREDITS_NOT_ISSUED to new status while assigning bccr_trading_name"""
        earned_credit = make_recipe(
            "compliance.tests.utils.compliance_earned_credit",
            earned_credits_amount=100,
            issuance_status=ComplianceEarnedCredit.IssuanceStatus.CREDITS_NOT_ISSUED,
            bccr_trading_name=None,  # Default state
        )

        earned_credit.issuance_status = ComplianceEarnedCredit.IssuanceStatus.ISSUANCE_REQUESTED
        earned_credit.bccr_trading_name = "new_trading_name"
        earned_credit.save()

        earned_credit.refresh_from_db()
        self.assertEqual(earned_credit.issuance_status, ComplianceEarnedCredit.IssuanceStatus.ISSUANCE_REQUESTED)
        self.assertEqual(earned_credit.bccr_trading_name, "new_trading_name")
