from typing import Optional
from compliance.models.compliance_earned_credit import ComplianceEarnedCredit
from registration.models.user_operator import UserOperator
from reporting.models.report import Report
from service.email.email_service import EmailService
import logging

from service.data_access_service.email_template_service import EmailNotificationTemplateService

logger = logging.getLogger(__name__)

email_service = EmailService()


def send_earned_credit_notification_email() -> None:
    """
    Sends an email to every operator's industry user for every operation that has earned credits, notifying of the credits’ availability.

    Raises:
        ValueError: If the email template is not found.

    Returns:
        None
    """
    template = EmailNotificationTemplateService.get_template_by_name('Notice of Earned Credits Generated')

    reports_with_earned_credits = Report.objects.filter(
    compliance_report__compliance_report_versions__compliance_earned_credit__isnull=False
)

    # populating email context 
    email_contexts = []
    for report in reports_with_earned_credits:
        for user_operators in UserOperator.objects.filter(operator=report.operator, status=UserOperator.Statuses.APPROVED):

            email_context = {
                "operator_legal_name": report.operator.legal_name,
                "operation_name": report.operation.name,
                "compliance_year": report.reporting_year.reporting_year,
                "earned_credit_amount": ComplianceEarnedCredit.objects.get(
        compliance_report_version__compliance_report__report=report
    ).earned_credits_amount,
                "email_address": user_operators.user.email,
                "testing_name": user_operators.user.first_name
            }
            email_contexts.append(email_context)

    for context in email_contexts:
        try:
            email_address_to_send_email_to: Optional[str] = context.get('email_address')
            response_json = email_service.send_email_by_template(template, context, [email_address_to_send_email_to])
            # Create email notification record to store transaction and message IDs
            email_service.create_email_notification_record(
                response_json['txId'],
                response_json['messages'][0]['msgId'],
                [email_address_to_send_email_to],
                template.id,
            )
        except Exception as exc:
            logger.error(f'Logger: Exception sending {template} email - {str(exc)}')


