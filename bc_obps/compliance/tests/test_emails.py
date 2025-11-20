from decimal import Decimal
from unittest.mock import patch
import uuid
from common.models import EmailNotification
from registration.models.app_role import AppRole
from registration.models.user import User
from registration.models.user_operator import UserOperator
from service.email.email_service import EmailService
import pytest
from service.data_access_service.email_template_service import EmailNotificationTemplateService
from model_bakery import baker
from compliance.emails import (
    _send_email_or_raise,
    _send_email_to_operators_approved_users_or_raise,
    send_notice_of_credits_requested_generated_email,
    send_notice_of_earned_credits_generated_email,
    send_notice_of_no_obligation_no_credits_generated_email,
    send_notice_of_obligation_due_email,
    send_notice_of_obligation_generated_email,
    send_supplementary_report_submitted_after_deadline,
    send_reminder_of_obligation_due_email,
    send_notice_of_obligation_met_email,
    send_notice_of_penalty_accrual_email,
)

pytestmark = pytest.mark.django_db
email_service = EmailService()
SEND_EMAIL_TO_OPERATORS_USERS_PATH = 'compliance.emails._send_email_to_operators_approved_users_or_raise'
SEND_EMAIL_OR_RAISE_PATH = 'compliance.emails._send_email_or_raise'


def mock_email_service(mocker):
    return mocker.patch.object(
        email_service,
        'send_email_by_template',
        return_value={'txId': str(uuid.uuid4()), 'messages': [{'msgId': str(uuid.uuid4())}]},
    )


class TestComplianceEmailHelpers:
    def test_send_email_or_raise_success(self, mocker):
        mocked_send_email = mock_email_service(mocker)
        template_instance = EmailNotificationTemplateService.get_template_by_name('Notice of Earned Credits Generated')
        recipients = ['email@email.com', 'email2@email.com']
        context = {"foo": "bar"}
        _send_email_or_raise(template_instance, context, recipients)
        # Assert that send_email_by_template is called exactly once
        mocked_send_email.assert_called_once_with(
            template_instance,
            context,
            recipients,
            cc_ghg_regulator=True,
        )

        # Assert that only one email notification record is created
        assert EmailNotification.objects.filter(template=template_instance).count() == 1

        # Get the created email notification record
        email_notification = EmailNotification.objects.get(template=template_instance)

        # Assert the notification record has the correct recipients
        assert set(email_notification.recipients_email) == set(recipients)

        # Assert the notification record has the correct template
        assert email_notification.template == template_instance

        # Assert that the notification record has transaction and message IDs
        assert email_notification.transaction_id is not None
        assert email_notification.message_id is not None

        # Assert that all expected recipients are included in the single email
        assert len(email_notification.recipients_email) == 2

    def test_send_email_or_raise_fail(self, mocker):

        template_instance = EmailNotificationTemplateService.get_template_by_name('Notice of Earned Credits Generated')
        mocked_send_email = mock_email_service(mocker)

        mocked_send_email.side_effect = Exception("Whoops")
        with patch('django.conf.settings.ENVIRONMENT', 'test'):
            with pytest.raises(Exception, match="Whoops"):
                _send_email_or_raise(template_instance, {"foo": "bar"}, ['email@email.com'])

    def test_send_email_to_operators_approved_users_or_raise_success(self, mocker):
        # admin user - should receive email
        approved_user_operator = baker.make_recipe(
            'registration.tests.utils.approved_user_operator',
        )
        # two reporter users with the same operator - should receive email
        users = baker.make(User, app_role=AppRole.objects.get(role_name="industry_user"), _quantity=2)
        baker.make_recipe(
            'registration.tests.utils.user_operator',
            user=users[0],
            operator=approved_user_operator.operator,
            status=UserOperator.Statuses.APPROVED,
        )
        baker.make_recipe(
            'registration.tests.utils.user_operator',
            user=users[1],
            operator=approved_user_operator.operator,
            status=UserOperator.Statuses.APPROVED,
        )

        # one declined user with the same operator - should NOT receive email
        declined_user = baker.make(User, app_role=AppRole.objects.get(role_name="industry_user"))
        baker.make_recipe(
            'registration.tests.utils.user_operator',
            user=declined_user,
            operator=approved_user_operator.operator,
            status=UserOperator.Statuses.DECLINED,
        )

        # some users from another operator - should not receive email
        other_operator_user_1 = baker.make_recipe(
            'registration.tests.utils.user_operator', status=UserOperator.Statuses.APPROVED
        )
        other_operator_user_2 = baker.make_recipe(
            'registration.tests.utils.user_operator', status=UserOperator.Statuses.APPROVED
        )

        template_instance = EmailNotificationTemplateService.get_template_by_name('Notice of Earned Credits Generated')
        mocked_send_email = mock_email_service(mocker)
        expected_context = {'context': 'context'}

        _send_email_to_operators_approved_users_or_raise(
            approved_user_operator.operator, template_instance, expected_context
        )

        # Assert that send_email_by_template is called once with all recipients
        expected_recipients = [
            approved_user_operator.user.email,
            users[0].email,
            users[1].email,
        ]

        # Assert that send_email_by_template is called exactly once
        mocked_send_email.assert_called_once_with(
            template_instance,
            expected_context,
            expected_recipients,
            cc_ghg_regulator=True,
        )

        # Assert that only one email notification record is created
        assert EmailNotification.objects.filter(template=template_instance).count() == 1

        # Get the created email notification record
        email_notification = EmailNotification.objects.get(template=template_instance)

        # Assert the notification record has the correct recipients
        assert set(email_notification.recipients_email) == set(expected_recipients)

        # Assert the notification record has the correct template
        assert email_notification.template == template_instance

        # Assert that the notification record has transaction and message IDs
        assert email_notification.transaction_id is not None
        assert email_notification.message_id is not None

        # Assert that all expected recipients are included in the single email
        assert len(email_notification.recipients_email) == 3  # admin + 2 users

        # Assert specific recipients are present
        recipient_emails = email_notification.recipients_email
        assert approved_user_operator.user.email in recipient_emails
        assert users[0].email in recipient_emails
        assert users[1].email in recipient_emails

        # Assert that users from other operators do NOT receive emails
        assert other_operator_user_1.user.email not in recipient_emails
        assert other_operator_user_2.user.email not in recipient_emails

        # Assert that declined user does NOT receive email
        assert declined_user.email not in recipient_emails

    def test_send_email_to_operators_approved_users_or_raise_fail(self, mocker):
        # Arrange: create an approved user_operator
        approved_user_operator = baker.make_recipe(
            'registration.tests.utils.approved_user_operator',
        )

        template_instance = EmailNotificationTemplateService.get_template_by_name('Notice of Earned Credits Generated')
        mocked_send_email = mock_email_service(mocker)

        mocked_send_email.side_effect = Exception("Whoops")
        with patch('django.conf.settings.ENVIRONMENT', 'test'):
            with pytest.raises(Exception, match="Whoops"):
                _send_email_to_operators_approved_users_or_raise(
                    approved_user_operator.operator, template_instance, {"foo": "bar"}
                )


class TestSendNotifications:
    @patch(SEND_EMAIL_TO_OPERATORS_USERS_PATH)
    def test_send_earned_credits_email(self, mock_send_email_to_operators_approved_users_or_raise):
        # admin user
        approved_user_operator = baker.make_recipe(
            'registration.tests.utils.approved_user_operator',
        )

        # Create a report with earned credits
        report = baker.make_recipe('reporting.tests.utils.report', operator=approved_user_operator.operator)
        compliance_report = baker.make_recipe('compliance.tests.utils.compliance_report', report=report)

        report_version = baker.make_recipe('reporting.tests.utils.report_version', report=report)
        report_operation = baker.make_recipe('reporting.tests.utils.report_operation', report_version=report_version)
        report_compliance_summary = baker.make_recipe(
            'compliance.tests.utils.report_compliance_summary', report_version=report_version
        )

        compliance_report_version = baker.make_recipe(
            'compliance.tests.utils.compliance_report_version',
            compliance_report=compliance_report,
            report_compliance_summary=report_compliance_summary,
        )
        earned_credit = baker.make_recipe(
            'compliance.tests.utils.compliance_earned_credit',
            compliance_report_version=compliance_report_version,
            earned_credits_amount=100,
        )

        template_instance = EmailNotificationTemplateService.get_template_by_name('Notice of Earned Credits Generated')
        expected_context = {
            "operator_legal_name": report_operation.operator_legal_name,
            "operation_name": report_operation.operation_name,
            "compliance_year": report.reporting_year.reporting_year,
            "earned_credit_amount": 100,
        }

        # Call the function with the earned credit ID
        send_notice_of_earned_credits_generated_email(earned_credit.id)
        mock_send_email_to_operators_approved_users_or_raise.assert_called_once_with(
            approved_user_operator.operator,
            template_instance,
            expected_context,
        )

    @patch(SEND_EMAIL_TO_OPERATORS_USERS_PATH)
    def test_send_earned_credits_email_does_not_send_when_amount_less_than_one(
        self, mock_send_email_to_operators_approved_users_or_raise
    ):
        approved_user_operator = baker.make_recipe(
            'registration.tests.utils.approved_user_operator',
        )

        report = baker.make_recipe('reporting.tests.utils.report', operator=approved_user_operator.operator)
        compliance_report = baker.make_recipe('compliance.tests.utils.compliance_report', report=report)
        compliance_report_version = baker.make_recipe(
            'compliance.tests.utils.compliance_report_version', compliance_report=compliance_report
        )
        earned_credit = baker.make_recipe(
            'compliance.tests.utils.compliance_earned_credit',
            compliance_report_version=compliance_report_version,
            earned_credits_amount=Decimal('0.5'),  # Amount greater than 0 but less than 1
        )

        # Call the function with the earned credit ID
        send_notice_of_earned_credits_generated_email(earned_credit.id)

        # Verify that the email function was not called
        mock_send_email_to_operators_approved_users_or_raise.assert_not_called()

    @patch(SEND_EMAIL_TO_OPERATORS_USERS_PATH)
    def test_send_no_obligation_no_credits_email(self, mock_send_email_to_operators_approved_users_or_raise):
        # admin user
        approved_user_operator = baker.make_recipe(
            'registration.tests.utils.approved_user_operator',
        )

        # Create a report with no obligation or earned credits
        report = baker.make_recipe('reporting.tests.utils.report', operator=approved_user_operator.operator)
        compliance_report = baker.make_recipe('compliance.tests.utils.compliance_report', report=report)

        report_version = baker.make_recipe('reporting.tests.utils.report_version', report=report)
        report_operation = baker.make_recipe('reporting.tests.utils.report_operation', report_version=report_version)
        report_compliance_summary = baker.make_recipe(
            'compliance.tests.utils.report_compliance_summary', report_version=report_version
        )

        compliance_report_version = baker.make_recipe(
            'compliance.tests.utils.compliance_report_version',
            compliance_report=compliance_report,
            report_compliance_summary=report_compliance_summary,
        )

        template_instance = EmailNotificationTemplateService.get_template_by_name(
            'No Obligation No Earned Credits Generated'
        )

        expected_context = {
            "operator_legal_name": report_operation.operator_legal_name,
            "operation_name": report_operation.operation_name,
            "compliance_year": report.reporting_year.reporting_year,
        }

        # Call the function with the report
        send_notice_of_no_obligation_no_credits_generated_email(compliance_report_version.id)
        mock_send_email_to_operators_approved_users_or_raise.assert_called_once_with(
            approved_user_operator.operator,
            template_instance,
            expected_context,
        )

    @patch(SEND_EMAIL_TO_OPERATORS_USERS_PATH)
    def test_obligation_email(self, mock_send_email_to_operators_approved_users_or_raise):
        # admin user
        approved_user_operator = baker.make_recipe(
            'registration.tests.utils.approved_user_operator',
        )

        # Create a report with no obligation or earned credits
        report = baker.make_recipe('reporting.tests.utils.report', operator=approved_user_operator.operator)
        compliance_report = baker.make_recipe('compliance.tests.utils.compliance_report', report=report)

        report_version = baker.make_recipe('reporting.tests.utils.report_version', report=report)
        report_operation = baker.make_recipe('reporting.tests.utils.report_operation', report_version=report_version)
        report_compliance_summary = baker.make_recipe(
            'compliance.tests.utils.report_compliance_summary', report_version=report_version
        )

        compliance_report_version = baker.make_recipe(
            'compliance.tests.utils.compliance_report_version',
            compliance_report=compliance_report,
            report_compliance_summary=report_compliance_summary,
        )

        template_instance = EmailNotificationTemplateService.get_template_by_name('Notice of Obligation Generated')

        expected_context = {
            "operator_legal_name": report_operation.operator_legal_name,
            "operation_name": report_operation.operation_name,
            "compliance_year": report.reporting_year.reporting_year,
        }

        # Call the function with the report id
        send_notice_of_obligation_generated_email(compliance_report_version.id)
        mock_send_email_to_operators_approved_users_or_raise.assert_called_once_with(
            approved_user_operator.operator,
            template_instance,
            expected_context,
        )

    @patch(SEND_EMAIL_OR_RAISE_PATH)
    def test_credits_requested_email(
        self,
        mock_send_email_or_raise,
        settings,
    ):
        settings.ENVIRONMENT = 'prod'
        # Create a report with earned credits
        report = baker.make_recipe('reporting.tests.utils.report')
        compliance_report = baker.make_recipe('compliance.tests.utils.compliance_report', report=report)

        report_version = baker.make_recipe('reporting.tests.utils.report_version', report=report)
        report_operation = baker.make_recipe('reporting.tests.utils.report_operation', report_version=report_version)
        report_compliance_summary = baker.make_recipe(
            'compliance.tests.utils.report_compliance_summary', report_version=report_version
        )

        compliance_report_version = baker.make_recipe(
            'compliance.tests.utils.compliance_report_version',
            compliance_report=compliance_report,
            report_compliance_summary=report_compliance_summary,
        )
        earned_credit = baker.make_recipe(
            'compliance.tests.utils.compliance_earned_credit',
            compliance_report_version=compliance_report_version,
            earned_credits_amount=100,
        )

        template_instance = EmailNotificationTemplateService.get_template_by_name('Notice of Credits Requested')
        expected_context = {
            "operator_legal_name": report_operation.operator_legal_name,
            "operation_name": report_operation.operation_name,
        }

        # Call the function with the earned credit id
        send_notice_of_credits_requested_generated_email(earned_credit.id)
        mock_send_email_or_raise.assert_called_once_with(
            template_instance, expected_context, ['GHGRegulator@gov.bc.ca'], cc_ghg_regulator=False
        )

    @patch(SEND_EMAIL_TO_OPERATORS_USERS_PATH)
    @patch(
        'compliance.service.elicensing_invoice_service.ComplianceReportVersionService.calculate_outstanding_balance_tco2e'
    )
    def test_obligation_due_email(
        self, mock_calculate_outstanding_balance_tco2e, mock_send_email_to_operators_approved_users_or_raise
    ):
        # admin user
        approved_user_operator = baker.make_recipe(
            'registration.tests.utils.approved_user_operator',
        )

        # Create mock data
        report = baker.make_recipe('reporting.tests.utils.report', operator=approved_user_operator.operator)
        compliance_report = baker.make_recipe('compliance.tests.utils.compliance_report', report=report)
        report_version = baker.make_recipe('reporting.tests.utils.report_version', report=report)
        report_operation = baker.make_recipe('reporting.tests.utils.report_operation', report_version=report_version)
        report_compliance_summary = baker.make_recipe(
            'compliance.tests.utils.report_compliance_summary', report_version=report_version
        )
        compliance_report_version = baker.make_recipe(
            'compliance.tests.utils.compliance_report_version',
            compliance_report=compliance_report,
            report_compliance_summary=report_compliance_summary,
        )
        invoice = baker.make_recipe('compliance.tests.utils.elicensing_invoice', outstanding_balance=Decimal('5.60'))
        obligation = baker.make_recipe(
            'compliance.tests.utils.compliance_obligation',
            compliance_report_version=compliance_report_version,
            elicensing_invoice=invoice,
        )

        template_instance = EmailNotificationTemplateService.get_template_by_name('Notice of Compliance Obligation Due')
        mock_calculate_outstanding_balance_tco2e.return_value = Decimal(1000.1234)

        report_version = obligation.compliance_report_version
        report = report_version.compliance_report.report
        report_operation = report_version.report_compliance_summary.report_version.report_operation
        reporting_year = report.reporting_year.reporting_year
        expected_context = {
            "operator_legal_name": report_operation.operator_legal_name,
            "operation_name": report_operation.operation_name,
            "compliance_period": reporting_year,
            "year_due": reporting_year + 1,
            "tonnes_of_co2": '1,000.1234',
            "outstanding_balance": '$5.60',
        }

        # Call the function with the obligcation id
        send_notice_of_obligation_due_email(obligation.id)
        mock_send_email_to_operators_approved_users_or_raise.assert_called_once_with(
            approved_user_operator.operator,
            template_instance,
            expected_context,
        )

    @patch(SEND_EMAIL_TO_OPERATORS_USERS_PATH)
    @patch(
        'compliance.service.elicensing_invoice_service.ComplianceReportVersionService.calculate_outstanding_balance_tco2e'
    )
    def test_obligation_reminder_email(
        self, mock_calculate_outstanding_balance_tco2e, mock_send_email_to_operators_approved_users_or_raise
    ):
        # admin user
        approved_user_operator = baker.make_recipe(
            'registration.tests.utils.approved_user_operator',
        )

        # Create mock data
        report = baker.make_recipe('reporting.tests.utils.report', operator=approved_user_operator.operator)
        compliance_report = baker.make_recipe('compliance.tests.utils.compliance_report', report=report)
        report_version = baker.make_recipe('reporting.tests.utils.report_version', report=report)
        report_operation = baker.make_recipe('reporting.tests.utils.report_operation', report_version=report_version)
        report_compliance_summary = baker.make_recipe(
            'compliance.tests.utils.report_compliance_summary', report_version=report_version
        )
        compliance_report_version = baker.make_recipe(
            'compliance.tests.utils.compliance_report_version',
            compliance_report=compliance_report,
            report_compliance_summary=report_compliance_summary,
        )
        invoice = baker.make_recipe('compliance.tests.utils.elicensing_invoice', outstanding_balance=Decimal('5.60'))
        obligation = baker.make_recipe(
            'compliance.tests.utils.compliance_obligation',
            compliance_report_version=compliance_report_version,
            elicensing_invoice=invoice,
        )

        template_instance = EmailNotificationTemplateService.get_template_by_name(
            'Reminder of Compliance Obligation Due'
        )
        mock_calculate_outstanding_balance_tco2e.return_value = Decimal(1000.1234)

        report_version = obligation.compliance_report_version
        report = report_version.compliance_report.report
        report_operation = report_version.report_compliance_summary.report_version.report_operation
        reporting_year = report.reporting_year.reporting_year
        expected_context = {
            "operator_legal_name": report_operation.operator_legal_name,
            "operation_name": report_operation.operation_name,
            "compliance_period": reporting_year,
            "year_due": reporting_year + 1,
            "tonnes_of_co2": '1,000.1234',
            "outstanding_balance": '$5.60',
        }

        # Call the function with the obligcation id
        send_reminder_of_obligation_due_email(obligation.id)
        mock_send_email_to_operators_approved_users_or_raise.assert_called_once_with(
            approved_user_operator.operator,
            template_instance,
            expected_context,
        )

    @patch(SEND_EMAIL_TO_OPERATORS_USERS_PATH)
    @patch('compliance.emails._prepare_obligation_context')
    def test_obligation_met_email(
        self, mock_prepare_obligation_context, mock_send_email_to_operators_approved_users_or_raise
    ):
        # admin user
        approved_user_operator = baker.make_recipe(
            'registration.tests.utils.approved_user_operator',
        )

        # Create mock data
        report = baker.make_recipe('reporting.tests.utils.report', operator=approved_user_operator.operator)
        compliance_report = baker.make_recipe('compliance.tests.utils.compliance_report', report=report)
        report_version = baker.make_recipe('reporting.tests.utils.report_version', report=report)
        report_operation = baker.make_recipe('reporting.tests.utils.report_operation', report_version=report_version)
        report_compliance_summary = baker.make_recipe(
            'compliance.tests.utils.report_compliance_summary', report_version=report_version
        )
        compliance_report_version = baker.make_recipe(
            'compliance.tests.utils.compliance_report_version',
            compliance_report=compliance_report,
            report_compliance_summary=report_compliance_summary,
        )
        invoice = baker.make_recipe('compliance.tests.utils.elicensing_invoice', outstanding_balance=Decimal('0'))
        obligation = baker.make_recipe(
            'compliance.tests.utils.compliance_obligation',
            compliance_report_version=compliance_report_version,
            elicensing_invoice=invoice,
        )

        template_instance = EmailNotificationTemplateService.get_template_by_name('Notice of Obligation Met')

        report_version = obligation.compliance_report_version
        report = report_version.compliance_report.report
        report_operation = report_version.report_compliance_summary.report_version.report_operation
        reporting_year = report.reporting_year.reporting_year
        expected_context = {
            "operator_legal_name": report_operation.operator_legal_name,
            "operation_name": report_operation.operation_name,
            "compliance_period": reporting_year,
            # the following properties aren't used in the email, but we're reusing the helper function that includes them
            "year_due": reporting_year + 1,
            "tonnes_of_co2": '1,000.1234',
            "outstanding_balance": '$0.00',
        }
        mock_prepare_obligation_context.return_value = expected_context

        # Call the function with the obligcation id
        send_notice_of_obligation_met_email(obligation.id)
        mock_send_email_to_operators_approved_users_or_raise.assert_called_once_with(
            approved_user_operator.operator,
            template_instance,
            expected_context,
        )


@patch(SEND_EMAIL_TO_OPERATORS_USERS_PATH)
@patch('compliance.emails._prepare_obligation_context')
def test_penalty_accrual_email(
    mock_prepare_obligation_context,
    mock_send_email_to_operators_approved_users_or_raise,
):
    # admin user
    approved_user_operator = baker.make_recipe(
        'registration.tests.utils.approved_user_operator',
    )

    # Build report hierarchy
    report = baker.make_recipe('reporting.tests.utils.report', operator=approved_user_operator.operator)
    compliance_report = baker.make_recipe('compliance.tests.utils.compliance_report', report=report)

    report_version = baker.make_recipe('reporting.tests.utils.report_version', report=report)
    report_operation = baker.make_recipe('reporting.tests.utils.report_operation', report_version=report_version)
    report_compliance_summary = baker.make_recipe(
        'compliance.tests.utils.report_compliance_summary', report_version=report_version
    )

    compliance_report_version = baker.make_recipe(
        'compliance.tests.utils.compliance_report_version',
        compliance_report=compliance_report,
        report_compliance_summary=report_compliance_summary,
    )
    invoice = baker.make_recipe('compliance.tests.utils.elicensing_invoice', outstanding_balance=Decimal('123.45'))
    obligation = baker.make_recipe(
        'compliance.tests.utils.compliance_obligation',
        compliance_report_version=compliance_report_version,
        elicensing_invoice=invoice,
    )

    # Expected template and context
    template_instance = EmailNotificationTemplateService.get_template_by_name(
        'Compliance Obligation Due Date Passed - Penalty now Accruing'
    )
    reporting_year = report.reporting_year.reporting_year
    expected_context = {
        "operator_legal_name": report_operation.operator_legal_name,
        "operation_name": report_operation.operation_name,
        "compliance_period": reporting_year,
        "year_due": reporting_year + 1,
        # values below aren’t used directly in this assertion path; they come from the helper:
        "tonnes_of_co2": '1,000.1234',
        "outstanding_balance": '$123.45',
    }
    mock_prepare_obligation_context.return_value = expected_context

    # Act
    send_notice_of_penalty_accrual_email(obligation.id)

    # Assert
    mock_prepare_obligation_context.assert_called_once_with(obligation)
    mock_send_email_to_operators_approved_users_or_raise.assert_called_once_with(
        approved_user_operator.operator,
        template_instance,
        expected_context,
    )

    @patch(SEND_EMAIL_TO_OPERATORS_USERS_PATH)
    @patch('compliance.emails._prepare_obligation_context')
    def test_supplementary_report_creates_obligation_email(
        self, mock_prepare_obligation_context, mock_send_email_to_operators_approved_users_or_raise
    ):
        # admin user
        approved_user_operator = baker.make_recipe(
            'registration.tests.utils.approved_user_operator',
        )

        # Create mock data
        report = baker.make_recipe('reporting.tests.utils.report', operator=approved_user_operator.operator)
        compliance_report = baker.make_recipe('compliance.tests.utils.compliance_report', report=report)
        report_version = baker.make_recipe('reporting.tests.utils.report_version', report=report)
        report_operation = baker.make_recipe('reporting.tests.utils.report_operation', report_version=report_version)
        report_compliance_summary = baker.make_recipe(
            'compliance.tests.utils.report_compliance_summary', report_version=report_version
        )
        compliance_report_version = baker.make_recipe(
            'compliance.tests.utils.compliance_report_version',
            compliance_report=compliance_report,
            report_compliance_summary=report_compliance_summary,
        )
        invoice = baker.make_recipe('compliance.tests.utils.elicensing_invoice')
        obligation = baker.make_recipe(
            'compliance.tests.utils.compliance_obligation',
            compliance_report_version=compliance_report_version,
            elicensing_invoice=invoice,
        )

        template_instance = EmailNotificationTemplateService.get_template_by_name(
            'Supplementary Report Submitted after Deadline'
        )

        report_version = obligation.compliance_report_version
        report = report_version.compliance_report.report
        report_operation = report_version.report_compliance_summary.report_version.report_operation
        reporting_year = report.reporting_year.reporting_year
        expected_context = {
            "operator_legal_name": report_operation.operator_legal_name,
            "operation_name": report_operation.operation_name,
            "compliance_period": reporting_year,
            # the following properties aren't used in the email, but we're reusing the helper function that includes them
            "year_due": reporting_year + 1,
            "tonnes_of_co2": '1,000.1234',
            "outstanding_balance": '$0.00',
        }
        mock_prepare_obligation_context.return_value = expected_context

        # Call the function with the obligcation id
        send_supplementary_report_submitted_after_deadline(obligation.id)
        mock_send_email_to_operators_approved_users_or_raise.assert_called_once_with(
            approved_user_operator.operator,
            template_instance,
            expected_context,
        )
