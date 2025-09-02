from compliance.service.elicensing.elicensing_interest_rate_service import ElicensingInterestRateService
from compliance.service.elicensing.elicensing_obligation_service import ElicensingObligationService
from compliance.service.automated_process.automated_process_service import AutomatedProcessService
from task_scheduler.service.retry_task.factories import create_retryable
from task_scheduler.service.scheduled_task.dataclass import ScheduledTaskConfig
from service.email.email_service import EmailService
import logging

from compliance.emails import send_earned_credit_notification_email

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

# Create retryable email function
retryable_earned_credit_notification_email = create_retryable(
    func=send_earned_credit_notification_email,
    tag="email_notifications",
    max_retries=5,
    retry_delay_minutes=10
)

###################
# Scheduled tasks #
###################

SCHEDULED_TASKS = [
    # We must run this task before refresh_all_obligation_invoices,
    # so we get the latest interest rates and then do the calculations
    ScheduledTaskConfig(
        func=ElicensingInterestRateService.refresh_interest_rates,
        schedule_type="daily",
        schedule_hour=1,
        schedule_minute=0,
        tag="elicensing",
    ),
    ScheduledTaskConfig(
        func=AutomatedProcessService.run_scheduled_compliance_sync,
        schedule_type="daily",
        schedule_hour=2,
        schedule_minute=0,
        tag="elicensing",
    ),
    ScheduledTaskConfig(
        func=retryable_earned_credit_notification_email,
        schedule_type="yearly",
    schedule_month=9,           
    schedule_day_of_month=24,   
    schedule_hour=2,            
    schedule_minute=0,          
    tag="earned_credit_notification"
    ),
]
