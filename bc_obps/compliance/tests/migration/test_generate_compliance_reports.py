import importlib
import pytest
from django.test import TestCase, override_settings
from model_bakery.baker import make_recipe
from decimal import Decimal
from registration.models import Operation
from reporting.models import ReportingYear
from compliance.models import ComplianceReportVersion, ComplianceObligation, ComplianceEarnedCredit

pytestmark = pytest.mark.django_db

migration_module = importlib.import_module('compliance.migrations.0030_generate_compliance_reports')
perform_migration = migration_module.perform_migration


def generate_emission_report_data(excess: Decimal, credited: Decimal, purpose: str):
    rep_year = ReportingYear.objects.get(reporting_year=2024)
    op = make_recipe(
        "registration.tests.utils.operation",
        status="Registered",
        bc_obps_regulated_operation=make_recipe("registration.tests.utils.boro_id"),
    )
    r = make_recipe("reporting.tests.utils.report", operation_id=op.id, reporting_year=rep_year)
    rv = make_recipe("reporting.tests.utils.report_version", report_id=r.id, is_latest_submitted=True, status='Draft')
    rcs = make_recipe(
        "reporting.tests.utils.report_compliance_summary",
        report_version_id=rv.id,
        excess_emissions=excess,
        credited_emissions=credited,
    )
    make_recipe("reporting.tests.utils.report_operation", report_version_id=rv.id, registration_purpose=purpose)
    rv.status = 'Submitted'
    rv.save()
    return rcs


class TestGenerateComplianceReportsMigration(TestCase):
    @override_settings(ENVIRONMENT="prod")
    def test_generates_expected_data(self):
        """Test the handle_emissions function with various scenarios."""
        # DATA SETUP
        regulated_with_emissions = generate_emission_report_data(
            Decimal('10000'), Decimal('0'), Operation.Purposes.OBPS_REGULATED_OPERATION
        )
        regulated_with_credits = generate_emission_report_data(
            Decimal('0'), Decimal('5000'), Operation.Purposes.OPTED_IN_OPERATION
        )
        regulated_neither = generate_emission_report_data(
            Decimal('0'), Decimal('0'), Operation.Purposes.NEW_ENTRANT_OPERATION
        )

        # CALL MIGRATION
        from django.apps import apps

        perform_migration(apps, None)

        # ASSERTIONS
        assert ComplianceReportVersion.objects.all().count() == 3
        assert (
            ComplianceReportVersion.objects.get(report_compliance_summary_id=regulated_with_emissions.id).status
            == ComplianceReportVersion.ComplianceStatus.OBLIGATION_PENDING_INVOICE_CREATION
        )
        assert (
            ComplianceReportVersion.objects.get(report_compliance_summary_id=regulated_with_credits.id).status
            == ComplianceReportVersion.ComplianceStatus.EARNED_CREDITS
        )
        assert (
            ComplianceReportVersion.objects.get(report_compliance_summary_id=regulated_neither.id).status
            == ComplianceReportVersion.ComplianceStatus.NO_OBLIGATION_OR_EARNED_CREDITS
        )
        assert (
            ComplianceObligation.objects.all().first().fee_amount_dollars
            == regulated_with_emissions.excess_emissions * 80
        )
        assert ComplianceEarnedCredit.objects.all().first().earned_credits_amount == int(
            regulated_with_credits.credited_emissions
        )

    @override_settings(ENVIRONMENT="prod")
    def test_only_considers_latest_submitted_reports(self):
        # DATA SETUP
        latest_regulated_with_emissions = generate_emission_report_data(
            Decimal('10000'), Decimal('0'), Operation.Purposes.OBPS_REGULATED_OPERATION
        )
        first_rv = make_recipe(
            "reporting.tests.utils.report_version",
            report_id=latest_regulated_with_emissions.report_version.report_id,
            is_latest_submitted=False,
            status='Draft',
        )
        first_rcs = make_recipe(
            "reporting.tests.utils.report_compliance_summary",
            report_version_id=first_rv.id,
            excess_emissions=Decimal('50'),
            credited_emissions=Decimal('0'),
        )
        first_rv.status = 'Submitted'
        first_rv.save()

        # CALL MIGRATION
        from django.apps import apps

        perform_migration(apps, None)

        # ASSERTIONS
        assert ComplianceReportVersion.objects.all().count() == 1
        assert (
            ComplianceReportVersion.objects.filter(
                report_compliance_summary_id=latest_regulated_with_emissions.id
            ).count()
            == 1
        )
        assert ComplianceReportVersion.objects.filter(report_compliance_summary_id=first_rcs.id).count() == 0

    @override_settings(ENVIRONMENT="prod")
    def test_skips_unregulated_reports(self):
        # DATA SETUP
        regulated_with_emissions = generate_emission_report_data(
            Decimal('10000'), Decimal('0'), Operation.Purposes.OBPS_REGULATED_OPERATION
        )
        unregulated_with_emissions = generate_emission_report_data(
            Decimal('10000'), Decimal('0'), Operation.Purposes.REPORTING_OPERATION
        )

        # CALL MIGRATION
        from django.apps import apps

        perform_migration(apps, None)

        # ASSERTIONS
        assert ComplianceReportVersion.objects.all().count() == 1
        assert (
            ComplianceReportVersion.objects.filter(report_compliance_summary_id=regulated_with_emissions.id).count()
            == 1
        )
        assert (
            ComplianceReportVersion.objects.filter(report_compliance_summary_id=unregulated_with_emissions.id).count()
            == 0
        )

    def test_skips_migration_in_non_prod_environment(self):
        # DATA SETUP
        generate_emission_report_data(Decimal('10000'), Decimal('0'), Operation.Purposes.OBPS_REGULATED_OPERATION)

        # CALL MIGRATION (should be skipped in non-prod)
        from django.apps import apps

        perform_migration(apps, None)

        # ASSERTIONS - no compliance reports should be created
        assert ComplianceReportVersion.objects.all().count() == 0
