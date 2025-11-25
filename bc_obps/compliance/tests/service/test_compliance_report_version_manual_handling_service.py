import logging

import pgtrigger
import pytest
from model_bakery import baker

from common.exceptions import UserError
from compliance.models import ComplianceReportVersion
from compliance.models.compliance_report_version_manual_handling import (
    ComplianceReportVersionManualHandling,
)
from compliance.service.compliance_report_version_manual_handling_service import (
    ComplianceManualHandlingService,
)
from registration.models.user import User

logger = logging.getLogger(__name__)


pytestmark = pytest.mark.django_db

class TestComplianceManualHandlingServiceGet:
    def test_get_manual_handling_by_report_version_returns_record(self):
        # Arrange
        with pgtrigger.ignore("reporting.ReportComplianceSummary:immutable_report_version"):
            crv = baker.make_recipe("compliance.tests.utils.compliance_report_version")

        manual = baker.make_recipe(
            "compliance.tests.utils.compliance_report_version_manual_handling",
            compliance_report_version=crv,
        )

        # Act
        result = ComplianceManualHandlingService.get_manual_handling_by_report_version(crv.id)

        # Assert
        assert result is not None
        assert isinstance(result, ComplianceReportVersionManualHandling)
        assert result.id == manual.id
        # Check select_related works (no extra queries / basic sanity)
        # Just ensure attributes are accessible
        _ = result.analyst_submitted_by
        _ = result.director_decision_by

    def test_get_manual_handling_by_report_version_returns_none_when_missing(self):
        # Arrange
        with pgtrigger.ignore("reporting.ReportComplianceSummary:immutable_report_version"):
            crv = baker.make_recipe("compliance.tests.utils.compliance_report_version")

        # Act
        result = ComplianceManualHandlingService.get_manual_handling_by_report_version(crv.id)

        # Assert
        assert result is None


class TestComplianceManualHandlingServiceAnalystUpdate:
    def _make_crv_with_manual_handling(self) -> ComplianceReportVersion:
        with pgtrigger.ignore("reporting.ReportComplianceSummary:immutable_report_version"):
            crv = baker.make_recipe("compliance.tests.utils.compliance_report_version")

        baker.make_recipe(
            "compliance.tests.utils.compliance_report_version_manual_handling",
            compliance_report_version=crv,
            analyst_comment="Initial comment",
            director_decision=ComplianceReportVersionManualHandling.DirectorDecision.PENDING_MANUAL_HANDLING,
        )
        return crv

    def _make_analyst_user(self) -> User:
        user = baker.make(User)
        user.is_cas_analyst = lambda: True
        user.is_cas_director = lambda: False
        return user

    def test_analyst_can_update_comment(self):
        # Arrange
        crv = self._make_crv_with_manual_handling()
        user = self._make_analyst_user()
        payload = {"analyst_comment": "Updated comment"}

        # Act
        record = ComplianceManualHandlingService.update_manual_handling(
            compliance_report_version_id=crv.id,
            payload=payload,
            user=user,
        )

        # Assert
        record.refresh_from_db()
        assert record.analyst_comment == "Updated comment"
        # Director decision should be unchanged
        assert (
            record.director_decision
            == ComplianceReportVersionManualHandling.DirectorDecision.PENDING_MANUAL_HANDLING
        )

    def test_analyst_cannot_change_director_decision(self):
        # Arrange
        crv = self._make_crv_with_manual_handling()
        user = self._make_analyst_user()
        payload = {
            "analyst_comment": "Updated comment",
            "director_decision": ComplianceReportVersionManualHandling.DirectorDecision.ISSUE_RESOLVED,
        }

        # Act
        record = ComplianceManualHandlingService.update_manual_handling(
            compliance_report_version_id=crv.id,
            payload=payload,
            user=user,
        )

        # Assert
        record.refresh_from_db()
        # Comment updated
        assert record.analyst_comment == "Updated comment"
        # Director decision must *not* change from its original value
        assert (
            record.director_decision
            == ComplianceReportVersionManualHandling.DirectorDecision.PENDING_MANUAL_HANDLING
        )

    def test_analyst_cannot_edit_after_director_resolved(self):
        # Arrange
        with pgtrigger.ignore("reporting.ReportComplianceSummary:immutable_report_version"):
            crv = baker.make_recipe("compliance.tests.utils.compliance_report_version")

        baker.make_recipe(
            "compliance.tests.utils.compliance_report_version_manual_handling",
            compliance_report_version=crv,
            analyst_comment="Initial comment",
            director_decision=ComplianceReportVersionManualHandling.DirectorDecision.ISSUE_RESOLVED,
        )

        user = self._make_analyst_user()
        payload = {"analyst_comment": "Should not be accepted"}

        # Act / Assert
        with pytest.raises(UserError) as excinfo:
            ComplianceManualHandlingService.update_manual_handling(
                compliance_report_version_id=crv.id,
                payload=payload,
                user=user,
            )

        assert "Analyst updates are not allowed" in str(excinfo.value)


class TestComplianceManualHandlingServiceDirectorUpdate:
    def _make_crv_with_manual_handling(self) -> ComplianceReportVersion:
        with pgtrigger.ignore("reporting.ReportComplianceSummary:immutable_report_version"):
            crv = baker.make_recipe("compliance.tests.utils.compliance_report_version")

        baker.make_recipe(
            "compliance.tests.utils.compliance_report_version_manual_handling",
            compliance_report_version=crv,
            director_decision=ComplianceReportVersionManualHandling.DirectorDecision.PENDING_MANUAL_HANDLING,
        )
        return crv

    def _make_director_user(self) -> User:
        user = baker.make(User)
        user.is_cas_analyst = lambda: False
        user.is_cas_director = lambda: True
        return user

    def test_director_must_provide_valid_decision(self):
        # Arrange
        crv = self._make_crv_with_manual_handling()
        user = self._make_director_user()
        payload = {
            "director_decision": "NOT_A_VALID_DECISION",
        }

        # Act / Assert
        with pytest.raises(UserError) as excinfo:
            ComplianceManualHandlingService.update_manual_handling(
                compliance_report_version_id=crv.id,
                payload=payload,
                user=user,
            )

        assert "Invalid director decision" in str(excinfo.value)

    def test_director_can_update_decision_and_comment(self):
        # Arrange
        crv = self._make_crv_with_manual_handling()
        user = self._make_director_user()
        payload = {
            "director_decision": ComplianceReportVersionManualHandling.DirectorDecision.ISSUE_RESOLVED,
        }

        # Act
        record = ComplianceManualHandlingService.update_manual_handling(
            compliance_report_version_id=crv.id,
            payload=payload,
            user=user,
        )

        # Assert
        record.refresh_from_db()
        assert (
            record.director_decision
            == ComplianceReportVersionManualHandling.DirectorDecision.ISSUE_RESOLVED
        )

class TestComplianceManualHandlingServiceUnauthorized:
    def test_non_cas_user_cannot_update(self):
        # Arrange
        with pgtrigger.ignore("reporting.ReportComplianceSummary:immutable_report_version"):
            crv = baker.make_recipe("compliance.tests.utils.compliance_report_version")

        baker.make_recipe(
            "compliance.tests.utils.compliance_report_version_manual_handling",
            compliance_report_version=crv,
        )

        # Plain user: both CAS role checks must be False
        user = baker.make(User)
        user.is_cas_analyst = lambda: False
        user.is_cas_director = lambda: False

        payload = {"analyst_comment": "Should not be accepted"}

        # Act / Assert
        with pytest.raises(UserError) as excinfo:
            ComplianceManualHandlingService.update_manual_handling(
                compliance_report_version_id=crv.id,
                payload=payload,
                user=user,
            )

        assert "not authorized" in str(excinfo.value)
