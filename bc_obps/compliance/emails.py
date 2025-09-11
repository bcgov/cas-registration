from typing import Dict, List
from common.models.email_notification_template import EmailNotificationTemplate
from compliance.models.compliance_earned_credit import ComplianceEarnedCredit
from registration.models.operator import Operator
from registration.models.user_operator import UserOperator
from reporting.models.report import Report
from service.email.email_service import EmailService
from service.email.utils import Recipient
import logging
from django.conf import settings


from service.data_access_service.email_template_service import EmailNotificationTemplateService

logger = logging.getLogger(__name__)

email_service = EmailService()


def _send_email_to_operators_approved_users_or_raise(
    operator: Operator, template: EmailNotificationTemplate, email_context: Dict[str, object]
) -> None:
    # All approved users for the operator of the report
    user_operators = UserOperator.objects.filter(operator=operator, status=UserOperator.Statuses.APPROVED)

    recipients: List[Recipient] = []
    for user_operator in user_operators:
        recipients.append(
            Recipient(full_name=user_operator.user.get_full_name(), email_address=user_operator.user.email)
        )

    if recipients:
        try:
            recipient_emails = [recipient.email_address for recipient in recipients]

            response_json = email_service.send_email_by_template(template, email_context, recipient_emails)
            # Create an email notification record to store transaction and message IDs
            if response_json:
                email_service.create_email_notification_record(
                    response_json['txId'],
                    response_json['messages'][0]['msgId'],
                    recipient_emails,
                    template.pk,
                )
        except Exception as exc:
            logger.error(f'Exception sending {template} email to recipients - {str(exc)}')
            # If we're in the local environment, we don't need to send emails, so we shouldn't raise an error if they fail
            environment = settings.ENVIRONMENT
            if environment != 'local':
                raise  # raise exception because we want to use this function as a retryable task


def send_notice_of_earned_credits_generated_email(compliance_earned_credit_id: int) -> None:
    """
    Sends an email to every operator's industry user for the specific earned credit, notifying of the credits' availability.

    Args:
        compliance_earned_credit_id: The ID of the ComplianceEarnedCredit instance for which to send notification emails.
    """
    template = EmailNotificationTemplateService.get_template_by_name('Notice of Earned Credits Generated')

    earned_credit = ComplianceEarnedCredit.objects.get(id=compliance_earned_credit_id)
    report = earned_credit.compliance_report_version.compliance_report.report
    email_context = {
        "operator_legal_name": report.operator.legal_name,
        "operation_name": report.operation.name,
        "compliance_year": report.reporting_year.reporting_year,
        "earned_credit_amount": earned_credit.earned_credits_amount,
    }

    _send_email_to_operators_approved_users_or_raise(report.operator, template, email_context)


def send_notice_of_no_obligation_no_credits_generated_email(report_id: int) -> None:
    """
    Sends an email to every operator's industry user when there is no obligation or credit, notifying that the obligation is met and no further action is required.

    Args:
        report_id: The if of the report instance for which to send notification emails.
    """
    report = Report.objects.get(id=report_id)
    template = EmailNotificationTemplateService.get_template_by_name('No Obligation No Earned Credits Generated')

    email_context = {
        "operator_legal_name": report.operator.legal_name,
        "operation_name": report.operation.name,
        "compliance_year": report.reporting_year.reporting_year,
    }

    _send_email_to_operators_approved_users_or_raise(report.operator, template, email_context)


def send_notice_of_obligation_generated_email(report_id: int) -> None:
    """
    Sends an email to every operator's industry user when there is an obligation, notifying that the obligation is available to view.

     Args:
        report_id: The if of the report instance for which to send notification emails.
    """
    report = Report.objects.get(id=report_id)
    template = EmailNotificationTemplateService.get_template_by_name('Notice of Obligation Generated')

    email_context = {
        "operator_legal_name": report.operator.legal_name,
        "operation_name": report.operation.name,
        "compliance_year": report.reporting_year.reporting_year,
    }

    _send_email_to_operators_approved_users_or_raise(report.operator, template, email_context)
