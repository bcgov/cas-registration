from decimal import Decimal
from uuid import UUID
import pytest
from django.test import TestCase
from django.db import connection
from registration.tests.utils.helpers import TestUtils
from registration.models.app_role import AppRole
from registration.models.user import User
from registration.models.operation import Operation
from registration.models.bc_greenhouse_gas_id import BcGreenhouseGasId
from compliance.models.compliance_period import CompliancePeriod
from compliance.models.compliance_summary import ComplianceSummary
from reporting.models.report import Report
from reporting.models.report_version import ReportVersion
from reporting.models.reporting_year import ReportingYear
from registration.utils import custom_reverse_lazy
from rls.utils.manager import RlsManager
from registration.models.operator import Operator
from registration.models.business_structure import BusinessStructure
from registration.models.address import Address
from registration.models.user_operator import UserOperator
import json


@pytest.fixture(scope='class')
def grant_erc_permissions():
    """Grant necessary permissions on erc and erc_history schemas for testing."""
    # Use the RlsManager to grant permissions
    rls_manager = RlsManager()

    # Grant all privileges on all schemas needed for testing
    with connection.cursor() as cursor:
        # Grant permissions to the industry_user role for the erc schema
        cursor.execute('GRANT ALL PRIVILEGES ON SCHEMA erc TO industry_user')
        cursor.execute('GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA erc TO industry_user')
        cursor.execute('GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA erc TO industry_user')

        # Grant permissions for erc_history schema
        cursor.execute('GRANT ALL PRIVILEGES ON SCHEMA erc_history TO industry_user')
        cursor.execute('GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA erc_history TO industry_user')
        cursor.execute('GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA erc_history TO industry_user')

        # Grant permissions for public schema and silk tables (for profiling)
        cursor.execute('GRANT ALL PRIVILEGES ON SCHEMA public TO industry_user')
        cursor.execute('GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO industry_user')
        cursor.execute('GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO industry_user')

        # Grant permissions for common schema
        cursor.execute('GRANT USAGE ON SCHEMA common TO industry_user')
        cursor.execute('GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA common TO industry_user')
        cursor.execute('GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA common TO industry_user')

    yield

    # Restore original privileges after the test
    rls_manager.reset_privileges_for_roles()


FIXTURE_UUID = "12345678-1234-4678-9234-567812345678"


@pytest.mark.django_db
@pytest.mark.usefixtures("grant_erc_permissions")
class TestComplianceSummaryIssuanceIntegration(TestCase):
    """
    Integration tests for compliance summary issuance functionality.

    These tests verify the integration between the database, service layer, and API
    for compliance summary issuance operations.
    """

    @classmethod
    def setUpClass(cls):
        """Set up test data that should be created once for all tests."""
        super().setUpClass()

        cls.app_role, _ = AppRole.objects.get_or_create(
            role_name='industry_user', defaults={'role_description': 'Industry User Role'}
        )

        cls.test_user, _ = User.objects.get_or_create(
            user_guid=UUID(FIXTURE_UUID),
            defaults={
                'business_guid': UUID('00000000-0000-0000-0000-000000000000'),
                'bceid_business_name': 'Test Business',
                'app_role': cls.app_role,
                'first_name': 'Test',
                'last_name': 'User',
                'email': 'test@example.com',
                'position_title': 'Test Position',
                'phone_number': '+16044011234',
            },
        )

        # If the user already exists, make sure it has the correct app_role
        if cls.test_user.app_role.role_name != 'industry_user':
            cls.test_user.app_role = cls.app_role
            cls.test_user.save(update_fields=['app_role'])

    def setUp(self):
        """Set up test data for each test."""
        # Set self.user to self.test_user so TestUtils methods work
        self.user = self.test_user

        self.auth_header = {'user_guid': str(self.user.user_guid)}
        self.auth_header_dumps = json.dumps(self.auth_header)

        # Set the my.guid session variable to the test user's UUID
        with connection.cursor() as cursor:
            cursor.execute('SET my.guid = %s', [str(FIXTURE_UUID)])
            cursor.execute('SET ROLE industry_user')

    def tearDown(self):
        """Clean up after each test."""
        # Reset the my.guid session variable
        with connection.cursor() as cursor:
            cursor.execute('RESET my.guid')
            cursor.execute('RESET ROLE')

    @classmethod
    def tearDownClass(cls):
        """Clean up after all tests."""
        # Don't delete the test user with the specific UUID as it might be needed by other tests
        super().tearDownClass()

    def test_get_compliance_summary_issuance(self):
        """Test retrieving issuance data for a compliance summary through the API."""
        # Get or create a reporting year and compliance period
        try:
            reporting_year = ReportingYear.objects.get(reporting_year=2023)
        except ReportingYear.DoesNotExist:
            reporting_year = ReportingYear.objects.create(
                reporting_year=2023,
                reporting_window_start="2023-01-01T00:00:00Z",
                reporting_window_end="2023-12-31T23:59:59Z",
                report_due_date="2024-06-01T23:59:59Z",
                description="Reporting Year 2023",
            )

        try:
            compliance_period = CompliancePeriod.objects.get(reporting_year=reporting_year)
        except CompliancePeriod.DoesNotExist:
            compliance_period = CompliancePeriod.objects.create(
                reporting_year=reporting_year,
                start_date="2023-01-01",
                end_date="2023-12-31",
                compliance_deadline="2024-06-30",
            )

        # Get an existing business structure for the operator
        business_structure = BusinessStructure.objects.get(name="BC Corporation")

        # First check if addresses already exist to avoid duplicates
        try:
            physical_address = Address.objects.filter(
                street_address='123 Test St', municipality='Test City', province='BC', postal_code='V1V1V1'
            ).first()

            if not physical_address:
                physical_address = Address.objects.create(
                    street_address='123 Test St', municipality='Test City', province='BC', postal_code='V1V1V1'
                )

            mailing_address = Address.objects.filter(
                street_address='123 Test St', municipality='Test City', province='BC', postal_code='V1V1V1'
            ).first()

            if not mailing_address:
                mailing_address = Address.objects.create(
                    street_address='123 Test St', municipality='Test City', province='BC', postal_code='V1V1V1'
                )
        except Exception:
            # If there's an error, use the same address for both
            physical_address = Address.objects.create(
                street_address='123 Test St', municipality='Test City', province='BC', postal_code='V1V1V1'
            )
            mailing_address = physical_address

        # Get or create an operator with all required fields
        try:
            operator = Operator.objects.get(legal_name="Test Operator")
        except Operator.DoesNotExist:
            operator = Operator.objects.create(
                legal_name="Test Operator",
                trade_name='Test Operator Trade Name',
                cra_business_number=123456789,
                bc_corporate_registry_number='ABC1234567',
                business_structure=business_structure,
                physical_address=physical_address,
                mailing_address=mailing_address,
                status=Operator.Statuses.APPROVED,
            )

        # Create the UserOperator relationship with the same operator that owns the operation
        UserOperator.objects.create(
            user_id=self.user.user_guid,
            operator=operator,  # Use the same operator that owns the operation
            status=UserOperator.Statuses.APPROVED,
            role=UserOperator.Roles.ADMIN,
        )

        # Create a BCGHG ID
        valid_bcghg_id = "12345678901"

        try:
            bcghg_id = BcGreenhouseGasId.objects.get(id=valid_bcghg_id)
        except BcGreenhouseGasId.DoesNotExist:
            # For creating a new BCGHG ID, we need to set the issued_by field
            bcghg_id = BcGreenhouseGasId.objects.create(id=valid_bcghg_id, issued_by=self.test_user)

        # Now get or create the operation with all required fields
        operation_name = "Test Operation For Integration Test"

        # First delete any existing operations with this name to avoid conflicts
        Operation.objects.filter(name=operation_name).delete()

        # Create a new operation linked to our operator
        operation = Operation.objects.create(
            name=operation_name,
            bcghg_id=bcghg_id,
            type=Operation.Types.SFO,
            operator=operator,
            status=Operation.Statuses.REGISTERED,
            registration_purpose=Operation.Purposes.OBPS_REGULATED_OPERATION,
        )

        try:
            report = Report.objects.get(operation=operation, reporting_year=reporting_year)
        except Report.DoesNotExist:
            report = Report.objects.create(operation=operation, operator=operator, reporting_year=reporting_year)

        try:
            report_version = ReportVersion.objects.filter(
                report=report, status=ReportVersion.ReportVersionStatus.Submitted
            ).first()
            if not report_version:
                report_version = ReportVersion.objects.create(
                    report=report,
                    status=ReportVersion.ReportVersionStatus.Submitted,
                    is_latest_submitted=True,
                    report_type=ReportVersion.ReportType.ANNUAL_REPORT,
                )
        except Exception:
            # Create a new report version if any error occurs
            report_version = ReportVersion.objects.create(
                report=report,
                status=ReportVersion.ReportVersionStatus.Submitted,
                is_latest_submitted=True,
                report_type=ReportVersion.ReportType.ANNUAL_REPORT,
            )

        # Create a compliance summary
        try:
            summary = ComplianceSummary.objects.get(report=report)
        except ComplianceSummary.DoesNotExist:
            summary = ComplianceSummary.objects.create(
                report=report,
                current_report_version=report_version,
                compliance_period=compliance_period,
                emissions_attributable_for_reporting=Decimal('10000.0000'),
                reporting_only_emissions=Decimal('1000.0000'),
                emissions_attributable_for_compliance=Decimal('9000.0000'),
                emission_limit=Decimal('10000.0000'),
                excess_emissions=Decimal('-1000.0000'),
                credited_emissions=Decimal('1000.0000'),
                reduction_factor=Decimal('0.9000'),
                tightening_rate=Decimal('0.0200'),
            )

        # Create the URL for the endpoint
        url = custom_reverse_lazy("get_compliance_summary_issuance", kwargs={"summary_id": summary.id})

        # Set up the database session variables to match the user
        with connection.cursor() as cursor:
            cursor.execute('SET my.guid = %s', [str(FIXTURE_UUID)])
            cursor.execute('SET ROLE industry_user')

        # Make the request with the TestUtils helper method
        response = TestUtils.mock_get_with_auth_role(self, "industry_user", url)

        # Verify response status code
        self.assertEqual(response.status_code, 200)

        response_data = response.json()

        # Verify the base attributes are passed through correctly
        self.assertEqual(response_data["id"], summary.id)
        self.assertEqual(Decimal(response_data["emissions_attributable_for_compliance"]), Decimal('9000.0000'))
        self.assertEqual(Decimal(response_data["emission_limit"]), Decimal('10000.0000'))
        self.assertEqual(Decimal(response_data["excess_emissions"]), Decimal('-1000.0000'))

        # Verify the computed attributes are calculated correctly by the service
        self.assertEqual(Decimal(response_data["excess_emissions_percentage"]), Decimal('90.00'))
        self.assertEqual(response_data["earned_credits"], 1000)
        self.assertEqual(response_data["earned_credits_issued"], False)
        self.assertEqual(response_data["issuance_status"], "Issuance not requested")

        # Verify related objects
        self.assertEqual(response_data["operation_name"], "Test Operation For Integration Test")
        self.assertEqual(response_data["reporting_year"], 2023)
