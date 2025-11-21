from typing import Dict, List
from common.models.email_notification_template import EmailNotificationTemplate
from compliance.models.compliance_earned_credit import ComplianceEarnedCredit
from compliance.models.compliance_obligation import ComplianceObligation
from compliance.models.compliance_report_version import ComplianceReportVersion
from registration.models.operator import Operator
from registration.models.user_operator import UserOperator
from service.email.email_service import GHG_REGULATOR_EMAIL, EmailService
from service.email.utils import Recipient
import logging
from django.conf import settings


from service.data_access_service.email_template_service import EmailNotificationTemplateService

logger = logging.getLogger(__name__)

email_service = EmailService()


def _send_email_or_raise(
    template: EmailNotificationTemplate,
    email_context: Dict[str, object],
    recipient_emails: List[str],
    cc_ghg_regulator: bool = True,
) -> None:
    try:

        response_json = email_service.send_email_by_template(
            template, email_context, recipient_emails, cc_ghg_regulator=cc_ghg_regulator
        )
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
        recipient_emails = [recipient.email_address for recipient in recipients]
        _send_email_or_raise(template, email_context, recipient_emails)


def send_notice_of_earned_credits_generated_email(compliance_earned_credit_id: int) -> None:
    """
    Sends an email to every operator's industry user for the specific earned credit, notifying of the credits' availability.
    Only sends the email if the earned credits amount is at least 1.

    Args:
        compliance_earned_credit_id: The ID of the ComplianceEarnedCredit instance for which to send notification emails.
    """
    earned_credit = ComplianceEarnedCredit.objects.get(id=compliance_earned_credit_id)

    # Only send email if the earned credits amount is at least 1
    if earned_credit.earned_credits_amount < 1:
        return

    template = EmailNotificationTemplateService.get_template_by_name('Notice of Earned Credits Generated')
    crv = earned_credit.compliance_report_version
    email_context = {
        "operator_legal_name": crv.report_compliance_summary.report_version.report_operation.operator_legal_name,
        "operation_name": crv.report_compliance_summary.report_version.report_operation.operation_name,
        "compliance_year": crv.compliance_report.report.reporting_year.reporting_year,
        "earned_credit_amount": earned_credit.earned_credits_amount,
    }

    _send_email_to_operators_approved_users_or_raise(crv.compliance_report.report.operator, template, email_context)


def send_notice_of_no_obligation_no_credits_generated_email(compliance_report_version_id: int) -> None:
    """
    Sends an email to every operator's industry user when there is no obligation or credit, notifying that the obligation is met and no further action is required.

    Args:
        compliance_report_version_id: The id of the compliance_report_version instance for which to send notification emails.
    """
    crv = ComplianceReportVersion.objects.get(id=compliance_report_version_id)
    template = EmailNotificationTemplateService.get_template_by_name('No Obligation No Earned Credits Generated')

    email_context = {
        "operator_legal_name": crv.report_compliance_summary.report_version.report_operation.operator_legal_name,
        "operation_name": crv.report_compliance_summary.report_version.report_operation.operation_name,
        "compliance_year": crv.compliance_report.report.reporting_year.reporting_year,
    }

    _send_email_to_operators_approved_users_or_raise(crv.compliance_report.report.operator, template, email_context)


def send_notice_of_obligation_generated_email(compliance_report_version_id: int) -> None:
    """
    Sends an email to every operator's industry user when there is an obligation, notifying that the obligation is available to view.

     Args:
        compliance_report_version_id: The id of the compliance_report_version instance for which to send notification emails.
    """
    crv = ComplianceReportVersion.objects.get(id=compliance_report_version_id)
    template = EmailNotificationTemplateService.get_template_by_name('Notice of Obligation Generated')

    email_context = {
        "operator_legal_name": crv.report_compliance_summary.report_version.report_operation.operator_legal_name,
        "operation_name": crv.report_compliance_summary.report_version.report_operation.operation_name,
        "compliance_year": crv.compliance_report.report.reporting_year.reporting_year,
    }

    _send_email_to_operators_approved_users_or_raise(crv.compliance_report.report.operator, template, email_context)


def send_notice_of_credits_requested_generated_email(compliance_earned_credit_id: int) -> None:
    """
    Sends an email to ghg regulator, notifying that an operation has requested earned credits. We only send this email when in prod so we don't confuse internal users.

     Args:
        compliance_earned_credit_id: The ID of the ComplianceEarnedCredit instance for which to send notification emails.
    """
    if settings.ENVIRONMENT != 'prod':
        return
    earned_credit = ComplianceEarnedCredit.objects.get(id=compliance_earned_credit_id)
    template = EmailNotificationTemplateService.get_template_by_name('Notice of Credits Requested')

    crv = earned_credit.compliance_report_version
    email_context: Dict[str, object] = {
        "operator_legal_name": crv.report_compliance_summary.report_version.report_operation.operator_legal_name,
        "operation_name": crv.report_compliance_summary.report_version.report_operation.operation_name,
    }

    recipient_emails = [GHG_REGULATOR_EMAIL]

    # We don't CC the GHG regulator for this email because the recipient is already the GHG regulator
    _send_email_or_raise(template, email_context, recipient_emails, cc_ghg_regulator=False)


def _prepare_obligation_context(obligation: ComplianceObligation) -> Dict:
    from compliance.service.compliance_report_version_service import ComplianceReportVersionService

    report_version = obligation.compliance_report_version
    report = report_version.compliance_report.report
    report_operation = report_version.report_compliance_summary.report_version.report_operation
    reporting_year = report.reporting_year.reporting_year

    email_context = {
        "operator_legal_name": report_operation.operator_legal_name,
        "operation_name": report_operation.operation_name,
        "compliance_period": reporting_year,
        "year_due": reporting_year + 1,
        "tonnes_of_co2": f"{ComplianceReportVersionService.calculate_outstanding_balance_tco2e(report_version):,.4f}",
        "outstanding_balance": f"${obligation.elicensing_invoice.invoice_fee_balance:,.2f}",  # type: ignore[union-attr]
    }
    return email_context


def send_notice_of_obligation_due_email(obligation_id: int) -> None:
    """
    Sends an email to every operator's industry user when compliance obligation invoices are generated, notifying that they can now pay their obligation.

     Args:
       obligation_id: The id of the obligation instance for which to send notification emails.
    """

    obligation = ComplianceObligation.objects.get(id=obligation_id)
    template = EmailNotificationTemplateService.get_template_by_name('Notice of Compliance Obligation Due')

    email_context = _prepare_obligation_context(obligation)

    _send_email_to_operators_approved_users_or_raise(
        obligation.compliance_report_version.compliance_report.report.operator, template, email_context
    )


def send_reminder_of_obligation_due_email(obligation_id: int) -> None:
    """
    Sends an email to every operator's industry user if an operation hasn't paid its obligation, reminding everyone when the obligation is due.

     Args:
        obligation_id: The id of the obligation instance for which to send notification emails.
    """

    obligation = ComplianceObligation.objects.get(id=obligation_id)
    template = EmailNotificationTemplateService.get_template_by_name('Reminder of Compliance Obligation Due')

    email_context = _prepare_obligation_context(obligation)

    _send_email_to_operators_approved_users_or_raise(
        obligation.compliance_report_version.compliance_report.report.operator, template, email_context
    )


def send_notice_of_obligation_met_email(obligation_id: int) -> None:
    """
    Sends an email to every operator's industry user when their obligation is met.

    Args:
        obligation_id: The id of the obligation instance for which to send notification emails.
    """
    obligation = ComplianceObligation.objects.get(id=obligation_id)
    template = EmailNotificationTemplateService.get_template_by_name('Notice of Obligation Met')
    email_context = _prepare_obligation_context(obligation)

    _send_email_to_operators_approved_users_or_raise(
        obligation.compliance_report_version.compliance_report.report.operator, template, email_context
    )


def send_notice_of_penalty_accrual_email(obligation_id: int) -> None:
    """
    Sends an email to every operator's industry user when the obligation's due date has passed and penalties are now accruing

    Args:
        obligation_id: The id of the ComplianceObligation instance for which to send notification emails.
    """
    obligation = ComplianceObligation.objects.get(id=obligation_id)
    template = EmailNotificationTemplateService.get_template_by_name(
        'Compliance Obligation Due Date Passed - Penalty now Accruing'
    )
    email_context = _prepare_obligation_context(obligation)

    _send_email_to_operators_approved_users_or_raise(
        obligation.compliance_report_version.compliance_report.report.operator,
        template,
        email_context,
    )


def send_supplementary_report_submitted_after_deadline(obligation_id: int) -> None:
    """
    Sends an email to every operator's industry user when they submit a supplementary report after the deadline that increases their emissions and results in a new obligation.

    Args:
        obligation_id: The id of the obligation instance for which to send notification emails.
    """
    obligation = ComplianceObligation.objects.get(id=obligation_id)
    template = EmailNotificationTemplateService.get_template_by_name('Supplementary Report Submitted after Deadline')
    email_context = _prepare_obligation_context(obligation)

    _send_email_to_operators_approved_users_or_raise(
        obligation.compliance_report_version.compliance_report.report.operator, template, email_context
    )
