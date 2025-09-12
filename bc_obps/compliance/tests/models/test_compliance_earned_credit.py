from rls.tests.helpers import assert_policies_for_cas_roles, assert_policies_for_industry_user
from common.tests.utils.helpers import BaseTestCase
from compliance.models import ComplianceEarnedCredit
from registration.tests.constants import TIMESTAMP_COMMON_FIELDS
from model_bakery.baker import make_recipe
from django.db import transaction
from django.db.utils import ProgrammingError
from datetime import date


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
            ("bccr_holding_account_id", "bccr holding account id", None, None),
            ("analyst_submitted_date", "analyst submitted date", None, None),
            ("analyst_submitted_by", "analyst submitted by", None, None),
            ("analyst_comment", "analyst comment", None, None),
            ("director_comment", "director comment", None, None),
            ("analyst_suggestion", "analyst suggestion", None, None),
            ("issuance_requested_date", "issuance requested date", None, None),
            ("bccr_project_id", "bccr project id", None, None),
            ("bccr_issuance_id", "bccr issuance id", None, None),
        ]


class ComplianceEarnedCreditBccrFieldsTriggerTest(BaseTestCase):
    def setUp(self):
        self.bccr_fields = [
            (
                "bccr_trading_name",
                "bccr_trading_name cannot be empty unless issuance_status is \"Credits Not Issued in BCCR\"",
            ),
            (
                "bccr_holding_account_id",
                "bccr_holding_account_id cannot be empty unless issuance_status is \"Credits Not Issued in BCCR\"",
            ),
        ]
        self.empty_values = ["", None]

    def test_create_with_null_bccr_fields_and_credits_not_issued_succeeds(self):
        earned_credit = make_recipe(
            "compliance.tests.utils.compliance_earned_credit",
            earned_credits_amount=100,
            issuance_status=ComplianceEarnedCredit.IssuanceStatus.CREDITS_NOT_ISSUED,
            bccr_trading_name=None,
            bccr_holding_account_id=None,
        )
        self.assertIsNone(earned_credit.bccr_trading_name)
        self.assertIsNone(earned_credit.bccr_holding_account_id)
        self.assertEqual(earned_credit.issuance_status, ComplianceEarnedCredit.IssuanceStatus.CREDITS_NOT_ISSUED)

    def _test_create_with_empty_field_fails(self, field_name, field_value, expected_error):
        with self.assertRaises(ProgrammingError) as cm:
            with transaction.atomic():
                make_recipe(
                    "compliance.tests.utils.compliance_earned_credit",
                    earned_credits_amount=100,
                    issuance_status=ComplianceEarnedCredit.IssuanceStatus.ISSUANCE_REQUESTED,
                    bccr_trading_name="valid_trading_name" if field_name != "bccr_trading_name" else field_value,
                    bccr_holding_account_id=(
                        "123456789012345" if field_name != "bccr_holding_account_id" else field_value
                    ),
                )
        self.assertIn(expected_error, str(cm.exception))

    def test_create_with_empty_bccr_fields_fails(self):
        for field_name, expected_error in self.bccr_fields:
            for field_value in self.empty_values:
                with self.subTest(field_name=field_name, field_value=field_value):
                    self._test_create_with_empty_field_fails(field_name, field_value, expected_error)

    def _test_update_to_empty_field_succeeds(self, field_name, field_value):
        earned_credit = make_recipe(
            "compliance.tests.utils.compliance_earned_credit",
            earned_credits_amount=100,
            issuance_status=ComplianceEarnedCredit.IssuanceStatus.CREDITS_NOT_ISSUED,
            bccr_trading_name="some_trading_name",
            bccr_holding_account_id="123456789012345",
        )

        setattr(earned_credit, field_name, field_value)
        earned_credit.save()

        earned_credit.refresh_from_db()
        self.assertEqual(getattr(earned_credit, field_name), field_value)

    def test_update_to_empty_bccr_fields_succeeds(self):
        for field_name, _ in self.bccr_fields:
            for field_value in self.empty_values:
                with self.subTest(field_name=field_name, field_value=field_value):
                    self._test_update_to_empty_field_succeeds(field_name, field_value)

    def _test_update_to_empty_field_fails(self, field_name, field_value, expected_error):
        earned_credit = make_recipe(
            "compliance.tests.utils.compliance_earned_credit",
            earned_credits_amount=100,
            issuance_status=ComplianceEarnedCredit.IssuanceStatus.ISSUANCE_REQUESTED,
            bccr_trading_name="some_trading_name",
            bccr_holding_account_id="123456789012345",
        )

        setattr(earned_credit, field_name, field_value)
        with self.assertRaises(ProgrammingError) as cm:
            with transaction.atomic():
                earned_credit.save()
        self.assertIn(expected_error, str(cm.exception))

    def test_update_to_empty_bccr_fields_fails(self):
        for field_name, expected_error in self.bccr_fields:
            for field_value in self.empty_values:
                with self.subTest(field_name=field_name, field_value=field_value):
                    self._test_update_to_empty_field_fails(field_name, field_value, expected_error)

    def _test_update_issuance_status_with_empty_field_fails(self, field_name, field_value, expected_error):
        earned_credit = make_recipe(
            "compliance.tests.utils.compliance_earned_credit",
            earned_credits_amount=100,
            issuance_status=ComplianceEarnedCredit.IssuanceStatus.CREDITS_NOT_ISSUED,
            bccr_trading_name="valid_trading_name" if field_name != "bccr_trading_name" else field_value,
            bccr_holding_account_id="123456789012345" if field_name != "bccr_holding_account_id" else field_value,
        )

        earned_credit.issuance_status = ComplianceEarnedCredit.IssuanceStatus.ISSUANCE_REQUESTED
        with self.assertRaises(ProgrammingError) as cm:
            with transaction.atomic():
                earned_credit.save()
        self.assertIn(expected_error, str(cm.exception))

    def test_update_issuance_status_with_empty_bccr_fields_fails(self):
        for field_name, expected_error in self.bccr_fields:
            for field_value in self.empty_values:
                with self.subTest(field_name=field_name, field_value=field_value):
                    self._test_update_issuance_status_with_empty_field_fails(field_name, field_value, expected_error)

    def test_create_with_valid_bccr_fields_and_any_status_succeeds(self):
        for status in ComplianceEarnedCredit.IssuanceStatus.choices:
            earned_credit = make_recipe(
                "compliance.tests.utils.compliance_earned_credit",
                earned_credits_amount=100,
                issuance_status=status[0],
                bccr_trading_name="valid_trading_name",
                bccr_holding_account_id="123456789012345",
            )
            self.assertEqual(earned_credit.bccr_trading_name, "valid_trading_name")
            self.assertEqual(earned_credit.bccr_holding_account_id, "123456789012345")
            self.assertEqual(earned_credit.issuance_status, status[0])

    def _test_update_field_with_valid_value_succeeds(self, field_name, new_value):
        earned_credit = make_recipe(
            "compliance.tests.utils.compliance_earned_credit",
            earned_credits_amount=100,
            issuance_status=ComplianceEarnedCredit.IssuanceStatus.ISSUANCE_REQUESTED,
            bccr_trading_name="initial_trading_name",
            bccr_holding_account_id="123456789012345",
        )

        setattr(earned_credit, field_name, new_value)
        earned_credit.save()

        earned_credit.refresh_from_db()
        self.assertEqual(getattr(earned_credit, field_name), new_value)

    def test_update_bccr_fields_with_valid_values_succeeds(self):
        field_updates = [
            ("bccr_trading_name", "updated_trading_name"),
            ("bccr_holding_account_id", "987654321098765"),
        ]

        for field_name, new_value in field_updates:
            with self.subTest(field_name=field_name, new_value=new_value):
                self._test_update_field_with_valid_value_succeeds(field_name, new_value)

    def test_transition_from_default_status_to_new_status_with_bccr_fields_succeeds(self):
        earned_credit = make_recipe(
            "compliance.tests.utils.compliance_earned_credit",
            earned_credits_amount=100,
            issuance_status=ComplianceEarnedCredit.IssuanceStatus.CREDITS_NOT_ISSUED,
        )

        earned_credit.issuance_status = ComplianceEarnedCredit.IssuanceStatus.ISSUANCE_REQUESTED
        earned_credit.bccr_trading_name = "new_trading_name"
        earned_credit.bccr_holding_account_id = "123456789012345"
        earned_credit.save()

        earned_credit.refresh_from_db()
        self.assertEqual(earned_credit.issuance_status, ComplianceEarnedCredit.IssuanceStatus.ISSUANCE_REQUESTED)
        self.assertEqual(earned_credit.bccr_trading_name, "new_trading_name")
        self.assertEqual(earned_credit.bccr_holding_account_id, "123456789012345")


class ComplianceEarnedCreditAnalystSubmissionTriggerTest(BaseTestCase):
    def test_populate_analyst_submission_info_when_comment_changes(self):
        # Arrange
        earned_credit = make_recipe(
            "compliance.tests.utils.compliance_earned_credit",
            analyst_comment="Initial comment",
            analyst_submitted_date=None,
            analyst_submitted_by=None,
        )

        # Act
        earned_credit.analyst_comment = "Updated comment"
        earned_credit.save()

        # Assert
        earned_credit.refresh_from_db()
        self.assertEqual(earned_credit.analyst_comment, "Updated comment")
        self.assertIsNotNone(earned_credit.analyst_submitted_date)
        self.assertIsNotNone(earned_credit.analyst_submitted_by)

    def test_does_not_populate_submission_info_when_comment_unchanged(self):
        # Arrange
        earned_credit = make_recipe(
            "compliance.tests.utils.compliance_earned_credit",
            analyst_comment="Same comment",
            analyst_submitted_date=None,
            analyst_submitted_by=None,
        )

        # Act - Update something else, not the comment
        earned_credit.earned_credits_amount = 200
        earned_credit.save()

        # Assert - Should not populate submission info
        earned_credit.refresh_from_db()
        self.assertEqual(earned_credit.earned_credits_amount, 200)
        self.assertIsNone(earned_credit.analyst_submitted_date)
        self.assertIsNone(earned_credit.analyst_submitted_by)

    def test_populate_analyst_submission_info_with_different_comment_scenarios(self):
        test_comment_scenarios = [
            ("Updated comment", "Initial comment"),  # Should populate submission info
            ("", "Initial comment"),  # Should populate for empty comment
            (None, "Initial comment"),  # Should populate for null comment
        ]
        for new_comment, initial_comment in test_comment_scenarios:
            with self.subTest(new_comment=new_comment, initial_comment=initial_comment):
                # Arrange
                earned_credit = make_recipe(
                    "compliance.tests.utils.compliance_earned_credit",
                    analyst_comment=initial_comment,
                    analyst_submitted_date=None,
                    analyst_submitted_by=None,
                )

                # Act
                earned_credit.analyst_comment = new_comment
                earned_credit.save()

                # Assert
                earned_credit.refresh_from_db()
                self.assertEqual(earned_credit.analyst_comment, new_comment)
                self.assertIsNotNone(earned_credit.analyst_submitted_date)
                self.assertIsNotNone(earned_credit.analyst_submitted_by)

    def test_analyst_submission_info_updated_when_comment_changes_with_existing_info(self):
        # Arrange - Create with existing submission info
        original_date = date(2024, 1, 15)
        original_user = make_recipe('registration.tests.utils.cas_analyst')
        earned_credit = make_recipe(
            "compliance.tests.utils.compliance_earned_credit",
            analyst_comment="Initial comment",
            analyst_submitted_date=original_date,
            analyst_submitted_by=original_user,
        )

        # Act - Update comment
        earned_credit.analyst_comment = "Updated comment"
        earned_credit.save()

        # Assert - Should update submission info when comment changes
        earned_credit.refresh_from_db()
        self.assertEqual(earned_credit.analyst_comment, "Updated comment")
        # The trigger should update these fields when comment changes
        self.assertIsNotNone(earned_credit.analyst_submitted_date)
        self.assertIsNotNone(earned_credit.analyst_submitted_by)
        # Should be different from original values (new date and potentially new user)
        self.assertNotEqual(earned_credit.analyst_submitted_date, original_date)


class ComplianceEarnedCreditIssuanceDateTriggerTest(BaseTestCase):
    def setUp(self):
        self.approved_status = ComplianceEarnedCredit.IssuanceStatus.APPROVED
        self.other_statuses = [
            ComplianceEarnedCredit.IssuanceStatus.DECLINED,
            ComplianceEarnedCredit.IssuanceStatus.CHANGES_REQUIRED,
            ComplianceEarnedCredit.IssuanceStatus.ISSUANCE_REQUESTED,
        ]

    def test_populate_issued_date_issued_by_when_approved_on_update(self):
        # Arrange
        earned_credit = make_recipe(
            "compliance.tests.utils.compliance_earned_credit",
            issuance_status=ComplianceEarnedCredit.IssuanceStatus.ISSUANCE_REQUESTED,
            bccr_trading_name="valid_trading_name",
            bccr_holding_account_id="123456789012345",
            issued_date=None,
            issued_by=None,
        )

        # Act
        earned_credit.issuance_status = self.approved_status
        earned_credit.save()

        # Assert
        earned_credit.refresh_from_db()
        self.assertEqual(earned_credit.issuance_status, self.approved_status)
        self.assertIsNotNone(earned_credit.issued_date)
        self.assertIsNotNone(earned_credit.issued_by)

    def test_populate_issued_date_issued_by_when_not_approved(self):
        for status in self.other_statuses:
            with self.subTest(status=status):
                # Arrange
                earned_credit = make_recipe(
                    "compliance.tests.utils.compliance_earned_credit",
                    issuance_status=ComplianceEarnedCredit.IssuanceStatus.ISSUANCE_REQUESTED,
                    bccr_trading_name="valid_trading_name",
                    bccr_holding_account_id="123456789012345",
                    issued_date=None,
                    issued_by=None,
                )

                # Act
                earned_credit.issuance_status = status
                earned_credit.save()

                # Assert
                earned_credit.refresh_from_db()
                self.assertEqual(earned_credit.issuance_status, status)
                self.assertIsNone(earned_credit.issued_date)
                self.assertIsNone(earned_credit.issued_by)


class ComplianceEarnedCreditIssuanceRequestedDateTriggerTest(BaseTestCase):
    def setUp(self):
        self.issuance_requested_status = ComplianceEarnedCredit.IssuanceStatus.ISSUANCE_REQUESTED
        self.other_statuses = [
            ComplianceEarnedCredit.IssuanceStatus.APPROVED,
            ComplianceEarnedCredit.IssuanceStatus.DECLINED,
            ComplianceEarnedCredit.IssuanceStatus.CHANGES_REQUIRED,
            ComplianceEarnedCredit.IssuanceStatus.CREDITS_NOT_ISSUED,
        ]

    def test_populate_issuance_requested_date_when_requested_on_update(self):
        # Arrange
        earned_credit = make_recipe(
            "compliance.tests.utils.compliance_earned_credit",
            issuance_status=ComplianceEarnedCredit.IssuanceStatus.CREDITS_NOT_ISSUED,
            issuance_requested_date=None,
        )

        # Act
        earned_credit.issuance_status = self.issuance_requested_status
        earned_credit.bccr_trading_name = "valid_trading_name"
        earned_credit.bccr_holding_account_id = "123456789012345"
        earned_credit.save()

        # Assert
        earned_credit.refresh_from_db()
        self.assertEqual(earned_credit.issuance_status, self.issuance_requested_status)

    def test_populate_issuance_requested_date_when_not_requested(self):
        for status in self.other_statuses:
            with self.subTest(status=status):
                # Arrange
                earned_credit = make_recipe(
                    "compliance.tests.utils.compliance_earned_credit",
                    issuance_status=ComplianceEarnedCredit.IssuanceStatus.CREDITS_NOT_ISSUED,
                    issuance_requested_date=None,
                )

                # Act
                earned_credit.issuance_status = status
                earned_credit.bccr_trading_name = "valid_trading_name"
                earned_credit.bccr_holding_account_id = "123456789012345"
                earned_credit.save()

                # Assert
                earned_credit.refresh_from_db()
                self.assertEqual(earned_credit.issuance_status, status)
                self.assertIsNone(earned_credit.issuance_requested_date)


#  RLS tests
class TestComplianceEarnedCreditRls(BaseTestCase):
    def test_compliance_earned_credit_rls_industry_user(self):
        # approved object
        approved_user_operator = make_recipe('registration.tests.utils.approved_user_operator')
        approved_operation = make_recipe(
            'registration.tests.utils.operation', operator=approved_user_operator.operator, status="Registered"
        )
        approved_report = make_recipe(
            'reporting.tests.utils.report', operation=approved_operation, operator=approved_user_operator.operator
        )
        approved_compliance_report = make_recipe('compliance.tests.utils.compliance_report', report=approved_report)
        approved_compliance_report_version = make_recipe(
            'compliance.tests.utils.compliance_report_version',
            compliance_report=approved_compliance_report,
            is_supplementary=False,
        )
        compliance_earned_credit = make_recipe(
            'compliance.tests.utils.compliance_earned_credit',
            id=10,
            compliance_report_version=approved_compliance_report_version,
            earned_credits_amount=100,
            bccr_trading_name="cheese",
            issuance_status=ComplianceEarnedCredit.IssuanceStatus.CREDITS_NOT_ISSUED,
            bccr_holding_account_id="123456789099999",
        )

        # second object
        random_operator = make_recipe('registration.tests.utils.operator')
        random_operation = make_recipe('registration.tests.utils.operation', operator=random_operator)
        random_report = make_recipe('reporting.tests.utils.report', operation=random_operation)
        random_compliance_report = make_recipe('compliance.tests.utils.compliance_report', report=random_report)
        random_compliance_report_version = make_recipe(
            'compliance.tests.utils.compliance_report_version', compliance_report=random_compliance_report
        )
        random_compliance_earned_credit = make_recipe(
            'compliance.tests.utils.compliance_earned_credit',
            id=20,
            compliance_report_version=random_compliance_report_version,
            earned_credits_amount=200,
            issuance_status=ComplianceEarnedCredit.IssuanceStatus.CREDITS_NOT_ISSUED,
            bccr_trading_name="bacon",
            bccr_holding_account_id="123456789012345",
        )

        # extra object for insert
        approved_compliance_report_version_for_insert = make_recipe(
            'compliance.tests.utils.compliance_report_version',
            compliance_report__report__operation=approved_operation,
            is_supplementary=False,
        )

        assert ComplianceEarnedCredit.objects.count() == 2

        def select_function(cursor):
            ComplianceEarnedCredit.objects.get(id=compliance_earned_credit.id)

        def forbidden_select_function(cursor):
            ComplianceEarnedCredit.objects.get(id=random_compliance_earned_credit.id)

        def insert_function(cursor):
            ComplianceEarnedCredit.objects.create(
                id=30,
                compliance_report_version=approved_compliance_report_version_for_insert,
                earned_credits_amount=150,
                issuance_status=ComplianceEarnedCredit.IssuanceStatus.CREDITS_NOT_ISSUED,
            )

        def forbidden_insert_function(cursor):
            cursor.execute(
                """
                    INSERT INTO "erc"."compliance_earned_credit" (
                        compliance_report_version_id,
                        bccr_trading_name
                    ) VALUES (
                        %s,
                        %s
                    )
                """,
                (random_compliance_report_version.id, "macaroni"),
            )

        def update_function(cursor):
            return ComplianceEarnedCredit.objects.filter(id=compliance_earned_credit.id).update(
                issuance_status=ComplianceEarnedCredit.IssuanceStatus.APPROVED
            )

        def forbidden_update_function(cursor):
            return ComplianceEarnedCredit.objects.filter(id=random_compliance_earned_credit.id).update(
                issuance_status=ComplianceEarnedCredit.IssuanceStatus.APPROVED
            )

        assert_policies_for_industry_user(
            ComplianceEarnedCredit,
            approved_user_operator.user,
            select_function=select_function,
            insert_function=insert_function,
            update_function=update_function,
            forbidden_select_function=forbidden_select_function,
            forbidden_insert_function=forbidden_insert_function,
            forbidden_update_function=forbidden_update_function,
        )

    def test_compliance_earned_credit_rls_cas_users(self):
        compliance_report = make_recipe('compliance.tests.utils.compliance_report')
        report_compliance_summary = make_recipe('compliance.tests.utils.report_compliance_summary')
        compliance_report_version = make_recipe(
            'compliance.tests.utils.compliance_report_version',
            compliance_report=compliance_report,
            report_compliance_summary=report_compliance_summary,
        )

        make_recipe(
            'compliance.tests.utils.compliance_earned_credit',
            id=15,
            issuance_status=ComplianceEarnedCredit.IssuanceStatus.CREDITS_NOT_ISSUED,
            compliance_report_version=compliance_report_version,
            earned_credits_amount=300,
            bccr_trading_name="ketchup",
            bccr_holding_account_id="111111111012345",
        )

        def select_function(cursor):
            assert ComplianceEarnedCredit.objects.count() == 1

        def update_function(cursor):
            updated_ComplianceEarnedCredit = ComplianceEarnedCredit.objects.first()
            updated_ComplianceEarnedCredit.issuance_status = ComplianceEarnedCredit.IssuanceStatus.APPROVED
            updated_ComplianceEarnedCredit.save()

            assert (
                ComplianceEarnedCredit.objects.filter(
                    issuance_status=ComplianceEarnedCredit.IssuanceStatus.APPROVED
                ).count()
                == 1
            )

        assert_policies_for_cas_roles(
            ComplianceEarnedCredit, select_function=select_function, update_function=update_function
        )
