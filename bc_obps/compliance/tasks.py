from compliance.service.elicensing.elicensing_obligation_service import ElicensingObligationService
from compliance.service.automated_process.automated_process_service import AutomatedProcessService
from task_scheduler.service.retry_task.factories import create_retryable
from task_scheduler.service.scheduled_task.dataclass import ScheduledTaskConfig
from service.email.email_service import EmailService
import logging

logger = logging.getLogger(__name__)
email_service = EmailService()


###################
# Retryable tasks #
###################

retryable_process_obligation_integration = create_retryable(
    func=ElicensingObligationService.process_obligation_integration,
    tag="elicensing_obligation_integration",
    max_retries=2,
    retry_delay_minutes=1,
)


###################
# Scheduled tasks #
###################


def daily_function_at_2am() -> None:
    try:
        email_data = {
            'bodyType': 'text',
            'body': 'This is your daily 2 AM task.',
            'contexts': [
                {
                    'context': {},
                    'to': ['sepehr.sobhani@gov.bc.ca', 'Dylan.1.Leard@gov.bc.ca'],
                }
            ],
            'from': 'no-reply.cas@gov.bc.ca',
            'subject': 'Daily 2 AM task',
        }

        response = email_service.merge_template_and_send(email_data)
        if response:
            logger.info(f"Daily 2 AM email sent successfully. Transaction ID: {response.get('txId')}")
        else:
            logger.warning("Daily 2 AM email sent but no response received from email service")
    except Exception as exc:
        logger.error(f"Failed to send daily 2 AM email: {str(exc)}")


SCHEDULED_TASKS = [
    ScheduledTaskConfig(
        func=daily_function_at_2am,
        schedule_type="daily",
        schedule_hour=2,
        schedule_minute=0,
        tag="daily_function_at_2am",
    ),
    ScheduledTaskConfig(
        func=AutomatedProcessService.refresh_all_obligation_invoices,
        schedule_type="daily",
        schedule_hour=2,
        schedule_minute=0,
        tag="elicensing",
    ),
]
