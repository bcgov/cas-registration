import importlib
import pytest
from django.test import TestCase, override_settings
from compliance.models import ComplianceReportVersion
from compliance.tests.utils.compliance_test_helper import ComplianceTestHelper


pytestmark = pytest.mark.django_db

migration_module = importlib.import_module(
    'compliance.migrations.0029_complianceobligation_add_invoice_number_and_populate'
)
populate_invoice_number_field = migration_module.populate_invoice_number_for_existing_obligation_records


class TestGenerateComplianceReportsMigration(TestCase):
    @override_settings(ENVIRONMENT="prod")
    def test_generates_expected_data__before_invoice_generation_date(self):
        """Test the handle_emissions function with various scenarios."""
        # DATA SETUP
        test_data_1 = ComplianceTestHelper.build_test_data(
            crv_status=ComplianceReportVersion.ComplianceStatus.OBLIGATION_NOT_MET, create_invoice_data=True
        )
        test_data_2 = ComplianceTestHelper.build_test_data(
            crv_status=ComplianceReportVersion.ComplianceStatus.OBLIGATION_NOT_MET, create_invoice_data=True
        )
        test_data_3 = ComplianceTestHelper.build_test_data(
            crv_status=ComplianceReportVersion.ComplianceStatus.OBLIGATION_NOT_MET, create_invoice_data=True
        )

        # CALL MIGRATION
        from django.apps import apps

        populate_invoice_number_field(apps, None)

        # ASSERTIONS
        test_data_1.compliance_obligation.invoice_number = (
            test_data_1.compliance_obligation.elicensing_invoice.invoice_number
        )
        test_data_2.compliance_obligation.invoice_number = (
            test_data_1.compliance_obligation.elicensing_invoice.invoice_number
        )
        test_data_3.compliance_obligation.invoice_number = (
            test_data_1.compliance_obligation.elicensing_invoice.invoice_number
        )
