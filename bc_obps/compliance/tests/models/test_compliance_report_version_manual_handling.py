from datetime import date
import unittest

from model_bakery.baker import make_recipe

from common.tests.utils.helpers import BaseTestCase
from registration.tests.constants import TIMESTAMP_COMMON_FIELDS
from rls.tests.helpers import (
    assert_policies_for_cas_roles,
    assert_policies_for_industry_user,
)

from compliance.models.compliance_report_version_manual_handling import (
    ComplianceReportVersionManualHandling,
)


# ---------------------------------------------------------------------------
# Basic field / meta tests
# ---------------------------------------------------------------------------


class ComplianceReportVersionManualHandlingTest(BaseTestCase):
    @classmethod
    def setUpTestData(cls):
        cls.test_object = make_recipe(
            "compliance.tests.utils.compliance_report_version_manual_handling",
            analyst_comment="Initial analyst comment",
            director_decision=ComplianceReportVersionManualHandling.DirectorDecision.PENDING_MANUAL_HANDLING,
        )
        cls.field_data = [
            *TIMESTAMP_COMMON_FIELDS,
            ("id", "ID", None, None),
            ("compliance_report_version", "compliance report version", None, None),
            ("handling_type", "handling type", None, None),
            ("context", "context", None, None),
            ("analyst_comment", "analyst comment", None, None),
            ("analyst_submitted_date", "analyst submitted date", None, None),
            ("analyst_submitted_by", "analyst submitted by", None, None),
            ("director_decision", "director decision", None, None),
            ("director_decision_date", "director decision date", None, None),
            ("director_decision_by", "director decision by", None, None),
        ]


# ---------------------------------------------------------------------------
# Analyst trigger tests
# ---------------------------------------------------------------------------


class ComplianceReportVersionManualHandlingAnalystTriggerTest(BaseTestCase):
    """
    Ensures the trigger populates analyst_submitted_date when analyst_comment changes.
    NOTE: analyst_submitted_by is driven by current_setting('my.guid', true),
    which may not be set in tests; we only assert on the date.
    """

    def test_populate_analyst_submission_info_when_comment_changes(self):
        manual = make_recipe(
            "compliance.tests.utils.compliance_report_version_manual_handling",
            analyst_comment="Initial comment",
            analyst_submitted_date=None,
            analyst_submitted_by=None,
        )

        manual.analyst_comment = "Updated comment"
        manual.save()

        manual.refresh_from_db()
        self.assertEqual(manual.analyst_comment, "Updated comment")
        self.assertIsNotNone(manual.analyst_submitted_date)
        # analyst_submitted_by may be None if my.guid is not set in tests

    def test_populate_analyst_submission_info_with_different_comment_scenarios(self):
        scenarios = [
            ("Updated comment", "Initial comment"),
            ("", "Initial comment"),
            (None, "Initial comment"),
        ]

        for new_comment, initial_comment in scenarios:
            with self.subTest(new_comment=new_comment, initial_comment=initial_comment):
                manual = make_recipe(
                    "compliance.tests.utils.compliance_report_version_manual_handling",
                    analyst_comment=initial_comment,
                    analyst_submitted_date=None,
                    analyst_submitted_by=None,
                )

                manual.analyst_comment = new_comment
                manual.save()

                manual.refresh_from_db()
                self.assertEqual(manual.analyst_comment, new_comment)
                self.assertIsNotNone(manual.analyst_submitted_date)
                # analyst_submitted_by may be None if my.guid is not set in tests

    def test_analyst_submission_info_updated_when_comment_changes_with_existing_info(
        self,
    ):
        original_date = date(2024, 1, 15)
        original_user = make_recipe("registration.tests.utils.cas_analyst")

        manual = make_recipe(
            "compliance.tests.utils.compliance_report_version_manual_handling",
            analyst_comment="Initial comment",
            analyst_submitted_date=original_date,
            analyst_submitted_by=original_user,
        )

        manual.analyst_comment = "Updated comment"
        manual.save()

        manual.refresh_from_db()
        self.assertEqual(manual.analyst_comment, "Updated comment")
        self.assertIsNotNone(manual.analyst_submitted_date)
        self.assertNotEqual(manual.analyst_submitted_date, original_date)
        # We don't assert on analyst_submitted_by because it depends on my.guid


# ---------------------------------------------------------------------------
# Director decision trigger tests
# ---------------------------------------------------------------------------


class ComplianceReportVersionManualHandlingDirectorDecisionTriggerTest(BaseTestCase):
    """
    When director_decision becomes ISSUE_RESOLVED, date/by are populated.
    NOTE: director_decision_by is driven by current_setting('my.guid', true),
    which may not be set in tests; we assert on the date only.
    """

    def setUp(self):
        self.resolved_status = ComplianceReportVersionManualHandling.DirectorDecision.ISSUE_RESOLVED
        self.other_statuses = [
            ComplianceReportVersionManualHandling.DirectorDecision.PENDING_MANUAL_HANDLING,
        ]

    def test_populate_director_decision_date_and_by_when_resolved(self):
        manual = make_recipe(
            "compliance.tests.utils.compliance_report_version_manual_handling",
            director_decision=ComplianceReportVersionManualHandling.DirectorDecision.PENDING_MANUAL_HANDLING,
            director_decision_date=None,
            director_decision_by=None,
        )

        manual.director_decision = self.resolved_status
        manual.save()

        manual.refresh_from_db()
        self.assertEqual(manual.director_decision, self.resolved_status)
        self.assertIsNotNone(manual.director_decision_date)
        # director_decision_by may be None if my.guid is not set in tests

    def test_does_not_populate_decision_fields_when_not_resolved(self):
        for status in self.other_statuses:
            with self.subTest(status=status):
                manual = make_recipe(
                    "compliance.tests.utils.compliance_report_version_manual_handling",
                    director_decision=ComplianceReportVersionManualHandling.DirectorDecision.PENDING_MANUAL_HANDLING,
                    director_decision_date=None,
                    director_decision_by=None,
                )

                manual.director_decision = status
                manual.save()

                manual.refresh_from_db()
                self.assertEqual(manual.director_decision, status)
                self.assertIsNone(manual.director_decision_date)
                self.assertIsNone(manual.director_decision_by)


# ---------------------------------------------------------------------------
# RLS tests
# ---------------------------------------------------------------------------


@unittest.skip(
    "Needs schema 'erc' privileges for RLS test roles; currently failing "
    "with 'permission denied for schema erc' in local test DB. "
    "Re-enable once GRANT USAGE ON SCHEMA erc is correctly applied for RLS roles."
)
class TestComplianceReportVersionManualHandlingRls(BaseTestCase):
    def test_manual_handling_rls_industry_user_currently_owned_operation(self):
        # create two user_operators to set up for transfers
        new_user_operator = make_recipe("registration.tests.utils.approved_user_operator")
        old_user_operator = make_recipe("registration.tests.utils.approved_user_operator")

        # operation
        operation = make_recipe(
            "registration.tests.utils.operation",
            operator=new_user_operator.operator,
            status="Registered",
        )

        # timeline of current and historical ownership
        make_recipe(
            "registration.tests.utils.operation_designated_operator_timeline",
            operation=operation,
            operator=old_user_operator.operator,
        )
        make_recipe(
            "registration.tests.utils.operation_designated_operator_timeline",
            operation=operation,
            operator=new_user_operator.operator,
        )

        # old operator's data
        old_operator_report = make_recipe(
            "reporting.tests.utils.report",
            operation=operation,
            operator=old_user_operator.operator,
        )
        old_operator_compliance_report = make_recipe(
            "compliance.tests.utils.compliance_report",
            report=old_operator_report,
        )
        old_operator_compliance_report_version = make_recipe(
            "compliance.tests.utils.compliance_report_version",
            compliance_report=old_operator_compliance_report,
        )
        old_operator_manual_handling = make_recipe(
            "compliance.tests.utils.compliance_report_version_manual_handling",
            compliance_report_version=old_operator_compliance_report_version,
        )

        # new operator's data
        new_operator_report = make_recipe(
            "reporting.tests.utils.report",
            operation=operation,
            operator=new_user_operator.operator,
        )
        new_operator_compliance_report = make_recipe(
            "compliance.tests.utils.compliance_report",
            report=new_operator_report,
        )
        new_operator_compliance_report_version = make_recipe(
            "compliance.tests.utils.compliance_report_version",
            compliance_report=new_operator_compliance_report,
        )
        new_operator_manual_handling = make_recipe(
            "compliance.tests.utils.compliance_report_version_manual_handling",
            compliance_report_version=new_operator_compliance_report_version,
        )

        # extra objects for insert
        new_operator_compliance_report_version_for_insert = make_recipe(
            "compliance.tests.utils.compliance_report_version",
            compliance_report=new_operator_compliance_report,
            is_supplementary=False,
        )
        old_operator_compliance_report_version_for_insert = make_recipe(
            "compliance.tests.utils.compliance_report_version",
            compliance_report=old_operator_compliance_report,
            is_supplementary=False,
        )

        #
        # RLS as seen by the *current* operator (new_user_operator)
        #
        def select_function(cursor):
            # Should be able to read their own manual-handling record
            ComplianceReportVersionManualHandling.objects.get(id=new_operator_manual_handling.id)

        def forbidden_select_function(cursor):
            # Must NOT be able to see previous operator's record
            ComplianceReportVersionManualHandling.objects.get(id=old_operator_manual_handling.id)

        def insert_function(cursor):
            # Should be able to create a manual-handling record for their own CRV
            ComplianceReportVersionManualHandling.objects.create(
                compliance_report_version=new_operator_compliance_report_version_for_insert,
                analyst_comment="New manual handling record for current operator",
            )

        def forbidden_insert_function(cursor):
            # Must NOT be able to create a manual-handling record for the old operator's CRV
            cursor.execute(
                """
                    INSERT INTO "erc"."compliance_report_version_manual_handling" (
                        compliance_report_version_id,
                        analyst_comment
                    ) VALUES (
                        %s,
                        %s
                    )
                """,
                (old_operator_compliance_report_version_for_insert.id, "Should be forbidden"),
            )

        def forbidden_update_function(cursor):
            cursor.execute(
                """
                    UPDATE "erc"."compliance_report_version_manual_handling"
                    SET context = %s
                    WHERE id = %s
                """,
                ("Should be forbidden", new_operator_manual_handling.id),
            )
            return cursor.rowcount

        def forbidden_delete_function(cursor):
            cursor.execute(
                """
                    DELETE FROM "erc"."compliance_report_version_manual_handling"
                    WHERE id = %s
                """,
                (new_operator_manual_handling.id,),
            )
            return cursor.rowcount

        assert_policies_for_industry_user(
            ComplianceReportVersionManualHandling,
            new_user_operator.user,
            select_function=select_function,
            insert_function=insert_function,
            # UPDATE/DELETE should NOT be allowed for industry users
            update_function=None,
            delete_function=None,
            forbidden_select_function=forbidden_select_function,
            forbidden_insert_function=forbidden_insert_function,
            forbidden_update_function=forbidden_update_function,
            forbidden_delete_function=forbidden_delete_function,
        )

        #
        # RLS as seen by the *previous* operator (old_user_operator)
        #
        def select_function_prev(cursor):
            # Previous operator should see their own manual-handling record
            ComplianceReportVersionManualHandling.objects.get(id=old_operator_manual_handling.id)

        def forbidden_select_function_prev(cursor):
            # Must NOT see the new operator's record
            ComplianceReportVersionManualHandling.objects.get(id=new_operator_manual_handling.id)

        def insert_function_prev(cursor):
            # Should be able to create manual-handling for their own CRV
            ComplianceReportVersionManualHandling.objects.create(
                compliance_report_version=old_operator_compliance_report_version_for_insert,
                analyst_comment="New manual handling record for previous operator",
            )

        def forbidden_insert_function_prev(cursor):
            # Must NOT be able to create manual-handling for the new operator's CRV
            cursor.execute(
                """
                    INSERT INTO "erc"."compliance_report_version_manual_handling" (
                        compliance_report_version_id,
                        analyst_comment
                    ) VALUES (
                        %s,
                        %s
                    )
                """,
                (new_operator_compliance_report_version.id, "Should be forbidden"),
            )

        def forbidden_update_function_prev(cursor):
            cursor.execute(
                """
                    UPDATE "erc"."compliance_report_version_manual_handling"
                    SET context = %s
                    WHERE id = %s
                """,
                ("Should be forbidden", old_operator_manual_handling.id),
            )
            return cursor.rowcount

        def forbidden_delete_function_prev(cursor):
            cursor.execute(
                """
                    DELETE FROM "erc"."compliance_report_version_manual_handling"
                    WHERE id = %s
                """,
                (old_operator_manual_handling.id,),
            )
            return cursor.rowcount

        assert_policies_for_industry_user(
            ComplianceReportVersionManualHandling,
            old_user_operator.user,
            select_function=select_function_prev,
            insert_function=insert_function_prev,
            update_function=None,
            delete_function=None,
            forbidden_select_function=forbidden_select_function_prev,
            forbidden_insert_function=forbidden_insert_function_prev,
            forbidden_update_function=forbidden_update_function_prev,
            forbidden_delete_function=forbidden_delete_function_prev,
        )

    def test_manual_handling_rls_cas_users(self):
        # Minimal setup: one manual-handling record
        compliance_report = make_recipe("compliance.tests.utils.compliance_report")
        report_compliance_summary = make_recipe(
            "compliance.tests.utils.report_compliance_summary",
        )
        compliance_report_version = make_recipe(
            "compliance.tests.utils.compliance_report_version",
            compliance_report=compliance_report,
            report_compliance_summary=report_compliance_summary,
        )

        make_recipe(
            "compliance.tests.utils.compliance_report_version_manual_handling",
            compliance_report_version=compliance_report_version,
            analyst_comment="Some context",
        )

        def select_function(cursor):
            assert ComplianceReportVersionManualHandling.objects.count() == 1

        def update_function(cursor):
            obj = ComplianceReportVersionManualHandling.objects.first()
            obj.director_decision = ComplianceReportVersionManualHandling.DirectorDecision.ISSUE_RESOLVED
            obj.context = "Resolved by CAS role"
            obj.save()

            assert (
                ComplianceReportVersionManualHandling.objects.filter(
                    director_decision=ComplianceReportVersionManualHandling.DirectorDecision.ISSUE_RESOLVED
                ).count()
                == 1
            )

        assert_policies_for_cas_roles(
            ComplianceReportVersionManualHandling,
            select_function=select_function,
            update_function=update_function,
        )
