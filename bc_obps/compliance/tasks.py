from celery import shared_task
import logging
from compliance.service.elicensing.obligation_elicensing_service import ObligationELicensingService
from compliance.models.elicensing_integration_queue import ElicensingIntegrationQueue

logger = logging.getLogger(__name__)


@shared_task(
    bind=True,
    max_retries=5,
    default_retry_delay=60,  # Start with 1 minute
    autoretry_for=(Exception,),
    retry_backoff=True,  # Exponential backoff
    retry_jitter=True,  # Add randomness to prevent thundering herd
)
def process_elicensing_integration(self, obligation_id: int):
    """
    Celery task for processing elicensing integration asynchronously.

    Args:
        obligation_id: The ID of the compliance obligation to process

    Returns:
        dict: Processing result
    """
    try:
        # Update queue status to processing
        queue_entry = ElicensingIntegrationQueue.objects.get(compliance_obligation_id=obligation_id)
        queue_entry.mark_processing()

        # Process the integration
        ObligationELicensingService.process_obligation_integration(obligation_id)

        # Mark as completed
        queue_entry.mark_completed()

        logger.info(f"Successfully processed elicensing integration for obligation {obligation_id}")

        return {'status': 'success', 'obligation_id': obligation_id, 'message': 'Integration completed successfully'}

    except Exception as exc:
        logger.error(f"Failed to process elicensing integration for obligation {obligation_id}: {str(exc)}", exc_info=True)

        # Update queue status
        try:
            queue_entry = ElicensingIntegrationQueue.objects.get(compliance_obligation_id=obligation_id)
            queue_entry.mark_for_retry(str(exc))
        except ElicensingIntegrationQueue.DoesNotExist:
            logger.warning(f"Queue entry not found for obligation {obligation_id}")

        # Re-raise to trigger Celery retry
        raise self.retry(exc=exc)


@shared_task
def cleanup_old_completed_integrations():
    """
    Clean up old completed integration records to prevent database bloat.
    """
    from django.utils import timezone
    from datetime import timedelta

    # Delete completed integrations older than 30 days
    cutoff_date = timezone.now() - timedelta(days=30)
    deleted_count = ElicensingIntegrationQueue.objects.filter(status=ElicensingIntegrationQueue.Status.COMPLETED, completed_at__lt=cutoff_date).delete()[0]

    logger.info(f"Cleaned up {deleted_count} old completed integration records")
    return deleted_count
