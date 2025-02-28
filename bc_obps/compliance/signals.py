from django.dispatch import receiver
from compliance.service.compliance_summary_service import ComplianceSummaryService
from events.signals import report_submitted


@receiver(report_submitted)
def handle_report_submission(sender, **kwargs):
    """
    Signal handler that creates a compliance summary when a report is submitted.
    
    Args:
        sender: The class that sent the signal
        **kwargs: Signal arguments including version_id and user_guid
    """
    version_id = kwargs.get('version_id')
    user_guid = kwargs.get('user_guid')
    
    if version_id and user_guid:
        ComplianceSummaryService.create_compliance_summary(version_id, user_guid) 