from rls.tests.helpers import assert_policies_for_cas_roles, assert_policies_for_industry_user
from common.tests.utils.helpers import BaseTestCase
from compliance.models import ComplianceEarnedCredit
from registration.tests.constants import TIMESTAMP_COMMON_FIELDS
from model_bakery.baker import make_recipe
from django.db import transaction
from django.db.utils import ProgrammingError
from datetime import date

from model_bakery import baker
from compliance.models.compliance_report_version_manual_handling import (
    ComplianceReportVersionManualHandling,
)
from registration.tests.utils.common import TIMESTAMP_COMMON_FIELDS  # adjust import path
from utils.tests.base import BaseTestCase  # adjust to your actual BaseTestCase import


class ComplianceReportVersionManualHandlingTest(BaseTestCase):
    @classmethod
    def setUpTestData(cls):
        cls.test_object = baker.make_recipe(
            "compliance.tests.utils.compliance_report_version_manual_handling",
            analyst_comment="Initial analyst comment",
            director_comment="Initial director comment",
            director_decision=ComplianceReportVersionManualHandling.DirectorDecision.PENDING_MANUAL_HANDLING,
        )
        cls.field_data = [
            *TIMESTAMP_COMMON_FIELDS,
            ("id", "ID", None, None),
            ("compliance_report_version", "compliance report version", None, None),
            ("analyst_comment", "analyst comment", None, None),
            ("director_comment", "director comment", None, None),
            ("director_decision", "director decision", None, None),
        ]

class ComplianceReportVersionManualHandlingBehaviourTest(BaseTestCase):
    def test_default_director_decision_is_pending_manual_handling(self):
        obj = make_recipe(
            "compliance.tests.utils.compliance_report_version_manual_handling",
        )
        self.assertEqual(
            obj.director_decision,
            ComplianceReportVersionManualHandling.DirectorDecision.PENDING_MANUAL_HANDLING,
        )

    def test_director_decision_choices_match_expected_values(self):
        field = ComplianceReportVersionManualHandling._meta.get_field("director_decision")
        # Extract the stored values from choices
        values = [choice[0] for choice in field.choices]

        self.assertIn(
            ComplianceReportVersionManualHandling.DirectorDecision.PENDING_MANUAL_HANDLING,
            values,
        )
        self.assertIn(
            ComplianceReportVersionManualHandling.DirectorDecision.ISSUE_RESOLVED,
            values,
        )
        self.assertEqual(len(values), 2)

    def test_comments_are_optional(self):
        obj = make_recipe(
            "compliance.tests.utils.compliance_report_version_manual_handling",
            analyst_comment=None,
            director_comment=None,
        )

        self.assertIsNone(obj.analyst_comment)
        self.assertIsNone(obj.director_comment)

    def test_one_to_one_relation_from_compliance_report_version(self):
        crv = make_recipe("compliance.tests.utils.compliance_report_version")
        manual = make_recipe(
            "compliance.tests.utils.compliance_report_version_manual_handling",
            compliance_report_version=crv,
        )

        # assumes related_name="manual_handling" on the FK
        self.assertEqual(crv.manual_handling, manual)
        self.assertEqual(manual.compliance_report_version, crv)

    def test_director_can_update_decision_and_comment(self):
        manual = make_recipe(
            "compliance.tests.utils.compliance_report_version_manual_handling",
            director_decision=ComplianceReportVersionManualHandling.DirectorDecision.PENDING_MANUAL_HANDLING,
            director_comment="Initial director comment",
        )

        manual.director_decision = (
            ComplianceReportVersionManualHandling.DirectorDecision.ISSUE_RESOLVED
        )
        manual.director_comment = "Issue resolved after manual review"
        manual.save()

        manual.refresh_from_db()
        self.assertEqual(
            manual.director_decision,
            ComplianceReportVersionManualHandling.DirectorDecision.ISSUE_RESOLVED,
        )
        self.assertEqual(manual.director_comment, "Issue resolved after manual review")

    def test_analyst_can_update_comment_independently(self):
        manual = make_recipe(
            "compliance.tests.utils.compliance_report_version_manual_handling",
            analyst_comment="Initial analyst comment",
        )

        manual.analyst_comment = "Updated analyst context"
        manual.save()

        manual.refresh_from_db()
        self.assertEqual(manual.analyst_comment, "Updated analyst context")
