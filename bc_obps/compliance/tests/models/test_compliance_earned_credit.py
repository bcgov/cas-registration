from rls.tests.helpers import assert_policies_for_cas_roles, assert_policies_for_industry_user, run_with_rollback
from common.tests.utils.helpers import BaseTestCase
from compliance.models import ComplianceEarnedCredit
from registration.tests.constants import TIMESTAMP_COMMON_FIELDS
from model_bakery.baker import make_recipe
from django.db import transaction
from django.db.utils import ProgrammingError
from datetime import date
from compliance.tests.utils.compliance_rls_test_infrastructure import ComplianceReportRlsTestSetup
from django.db import connection
from rls.middleware.rls import RlsMiddleware


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
            ("supplementary_declined", "supplementary declined", None, None),
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
    def test_populate_analyst_submission_info_when_suggestion_changes(self):
        # Arrange
        earned_credit = make_recipe(
            "compliance.tests.utils.compliance_earned_credit",
            analyst_submitted_date=None,
            analyst_submitted_by=None,
        )

        # Act
        earned_credit.analyst_suggestion = "Ready to approve"
        earned_credit.save()

        # Assert
        earned_credit.refresh_from_db()
        self.assertEqual(earned_credit.analyst_suggestion, "Ready to approve")
        self.assertIsNotNone(earned_credit.analyst_submitted_date)
        self.assertIsNotNone(earned_credit.analyst_submitted_by)

    def test_does_not_populate_submission_info_when_suggestion_unchanged(self):
        # Arrange
        earned_credit = make_recipe(
            "compliance.tests.utils.compliance_earned_credit",
            analyst_suggestion="Requiring change of BCCR Holding Account ID",
            analyst_comment="a comment",
            analyst_submitted_date=None,
            analyst_submitted_by=None,
        )

        # Act - Update something else, not the suggestion
        earned_credit.earned_credits_amount = 200
        earned_credit.analyst_comment = "another comment"
        earned_credit.save()

        # Assert - Should not populate submission info, a comment itself is not a true submission
        earned_credit.refresh_from_db()
        self.assertEqual(earned_credit.analyst_suggestion, "Requiring change of BCCR Holding Account ID")
        self.assertEqual(earned_credit.analyst_comment, "another comment")
        self.assertEqual(earned_credit.earned_credits_amount, 200)
        self.assertIsNone(earned_credit.analyst_submitted_date)
        self.assertIsNone(earned_credit.analyst_submitted_by)

    def test_populate_analyst_submission_info_with_different_suggestion_scenarios(self):
        test_suggest_scenarios = [
            ("Requiring change of BCCR Holding Account ID", None),  # Should populate submission info
            ("Ready to approve", None),  # Should populate for empty comment
            ("Requiring supplementary report", None),  # Should populate for null comment
            (
                "Ready to approve",
                "Requiring change of BCCR Holding Account ID",
            ),  # Should populate with requiring change suggestion
        ]
        for new_suggestion, initial_suggestion in test_suggest_scenarios:
            with self.subTest(new_suggestion=new_suggestion, initial_suggestion=initial_suggestion):
                # Arrange
                earned_credit = make_recipe(
                    "compliance.tests.utils.compliance_earned_credit",
                    analyst_suggestion=initial_suggestion,
                    analyst_submitted_date=None,
                    analyst_submitted_by=None,
                )

                # Act
                earned_credit.analyst_suggestion = new_suggestion
                earned_credit.save()

                # Assert
                earned_credit.refresh_from_db()
                self.assertEqual(earned_credit.analyst_suggestion, new_suggestion)
                self.assertIsNotNone(earned_credit.analyst_submitted_date)
                self.assertIsNotNone(earned_credit.analyst_submitted_by)

    def test_analyst_submission_info_updated_when_suggestion_changes_with_existing_info(self):
        # Arrange - Create with existing submission info
        original_date = date(2024, 1, 15)
        original_user = make_recipe('registration.tests.utils.cas_analyst')
        earned_credit = make_recipe(
            "compliance.tests.utils.compliance_earned_credit",
            analyst_suggestion="Requiring change of BCCR Holding Account ID",
            analyst_submitted_date=original_date,
            analyst_submitted_by=original_user,
        )

        # Act - Update suggestion
        earned_credit.analyst_suggestion = "Ready to approve"
        earned_credit.save()

        # Assert - Should update submission info when suggestion changes
        earned_credit.refresh_from_db()
        self.assertEqual(earned_credit.analyst_suggestion, "Ready to approve")
        # The trigger should update these fields when suggestion changes
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
            with self.subTest(status=status.value):
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
            with self.subTest(status=status.value):
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
        t = ComplianceReportRlsTestSetup()

        # within access bounds
        ec_2010 = make_recipe(
            'compliance.tests.utils.compliance_earned_credit',
            compliance_report_version=t.compliance_report_version_2010,
            bccr_trading_name='asdf',
            bccr_holding_account_id='asdf',
        )
        supp_compliance_report_version_2010 = make_recipe(
            'compliance.tests.utils.compliance_report_version',
            compliance_report=t.compliance_report_2010,
            is_supplementary=True,
        )

        # outside access bounds
        ec_2013 = make_recipe(
            'compliance.tests.utils.compliance_earned_credit',
            compliance_report_version=t.compliance_report_version_2013,
            bccr_trading_name='asdf',
            bccr_holding_account_id='asdf',
        )
        supp_compliance_report_version_2013 = make_recipe(
            'compliance.tests.utils.compliance_report_version',
            compliance_report=t.compliance_report_2013,
            is_supplementary=True,
        )

        def select_function(cursor):
            ComplianceEarnedCredit.objects.get(id=ec_2010.id)

        def forbidden_select_function(cursor):
            ComplianceEarnedCredit.objects.get(id=ec_2013.id)

        def insert_function(cursor):
            ComplianceEarnedCredit.objects.create(
                compliance_report_version=supp_compliance_report_version_2010,
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
                (supp_compliance_report_version_2013.id, "macaroni"),
            )

        def update_function(cursor):
            cursor.execute(
                """
                    UPDATE "erc"."compliance_earned_credit"
                    SET issuance_status = %s
                    WHERE id = %s
                """,
                (ComplianceEarnedCredit.IssuanceStatus.APPROVED, ec_2010.id),
            )
            return cursor.rowcount

        def forbidden_update_function(cursor):
            cursor.execute(
                """
                    UPDATE "erc"."compliance_earned_credit"
                    SET issuance_status = %s
                    WHERE id = %s
                """,
                (ComplianceEarnedCredit.IssuanceStatus.APPROVED, ec_2013.id),
            )
            return cursor.rowcount

        # Extra assert for forbidden delete unless crv is superceded
        # Ensure status is not 'Superceded' to prevent delete
        t.compliance_report_version_2010.status = 'Obligation not met'
        t.compliance_report_version_2010.save()

        def forbidden_delete_unless_superceded(cursor):
            cursor.execute(
                """
                    DELETE FROM "erc"."compliance_earned_credit"
                    WHERE id = %s
                """,
                (ec_2010.id,),
            )
            return cursor.rowcount

        with connection.cursor() as cursor:
            RlsMiddleware._set_user_guid_and_role(cursor, t.approved_user_operator.user)
            forbidden_deleted_records_count = run_with_rollback(cursor, forbidden_delete_unless_superceded)
            assert (
                forbidden_deleted_records_count == 0
            ), f"Expected 0 deleted records when status is not 'Superceded', but got {forbidden_deleted_records_count} (did you remember to return in the delete function?)"

        # Update status to 'Superceded' to allow for delete
        t.compliance_report_version_2010.status = 'Superceded'
        t.compliance_report_version_2010.save()

        def delete_function(cursor):
            cursor.execute(
                """
                   DELETE FROM "erc"."compliance_earned_credit"
                   WHERE id = %s
                """,
                (ec_2010.id,),
            )
            return cursor.rowcount

        def forbidden_delete_function(cursor):
            cursor.execute(
                """
                   DELETE FROM "erc"."compliance_earned_credit"
                   WHERE id = %s
                """,
                (ec_2013.id,),
            )
            return cursor.rowcount

        assert_policies_for_industry_user(
            ComplianceEarnedCredit,
            t.approved_user_operator.user,
            select_function=select_function,
            insert_function=insert_function,
            update_function=update_function,
            delete_function=delete_function,
            forbidden_select_function=forbidden_select_function,
            forbidden_insert_function=forbidden_insert_function,
            forbidden_update_function=forbidden_update_function,
            forbidden_delete_function=forbidden_delete_function,
        )

    def test_compliance_earned_credit_rls_cas_users(self):
        t = ComplianceReportRlsTestSetup()

        make_recipe(
            'compliance.tests.utils.compliance_obligation', compliance_report_version=t.compliance_report_version_2010
        )
        ec_2013 = make_recipe(
            'compliance.tests.utils.compliance_obligation', compliance_report_version=t.compliance_report_version_2013
        )

        def select_function(cursor):
            assert ComplianceEarnedCredit.objects.count() == 1

        def update_function(cursor):
            ec_2013.issuance_status = ComplianceEarnedCredit.IssuanceStatus.APPROVED
            ec_2013.save()

            assert (
                ComplianceEarnedCredit.objects.filter(
                    issuance_status=ComplianceEarnedCredit.IssuanceStatus.APPROVED
                ).count()
                == 1
            )

        assert_policies_for_cas_roles(
            ComplianceEarnedCredit, select_function=select_function, update_function=update_function
        )
