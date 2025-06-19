import logging
from typing import List
from django.utils import timezone
from django.db import transaction
from compliance.models.elicensing_integration_queue import ElicensingIntegrationQueue
from compliance.service.elicensing.obligation_elicensing_service import ObligationELicensingService

logger = logging.getLogger(__name__)


class ElicensingIntegrationQueueService:
    """
    Service for managing the elicensing integration queue.
    This service handles queuing integration tasks and provides
    basic queue management functionality.
    """

    @classmethod
    def queue_obligation_integration(cls, obligation_id: int) -> ElicensingIntegrationQueue:
        """
        Queue an obligation for elicensing integration.

        Args:
            obligation_id: The ID of the compliance obligation to queue

        Returns:
            The created queue entry
        """
        queue_entry, created = ElicensingIntegrationQueue.objects.get_or_create(
            compliance_obligation_id=obligation_id,
            defaults={
                'status': ElicensingIntegrationQueue.Status.PENDING,
                'retry_count': 0,
                'max_retries': 5,
            },
        )

        if created:
            logger.info(f"Queued obligation {obligation_id} for elicensing integration")
        else:
            logger.info(f"Obligation {obligation_id} already queued for elicensing integration")

        return queue_entry

    @classmethod
    def process_pending_integrations(cls, max_retries: int = 5) -> dict:
        """
        Process all pending integrations that are ready for retry.

        Args:
            max_retries: Maximum number of retries to process

        Returns:
            Dictionary with processing statistics
        """
        now = timezone.now()

        # Get all pending or failed integrations that are ready for processing
        ready_integrations = ElicensingIntegrationQueue.objects.filter(
            status__in=[ElicensingIntegrationQueue.Status.PENDING, ElicensingIntegrationQueue.Status.FAILED], retry_count__lt=max_retries, next_retry_at__lte=now
        ).select_related('compliance_obligation')

        stats = {'processed': 0, 'succeeded': 0, 'failed': 0, 'errors': []}

        for queue_entry in ready_integrations:
            try:
                cls._process_single_integration(queue_entry)
                stats['succeeded'] += 1
            except Exception as e:
                error_msg = f"Failed to process integration for obligation {queue_entry.compliance_obligation_id}: {str(e)}"
                logger.error(error_msg, exc_info=True)
                queue_entry.mark_for_retry(str(e))
                stats['failed'] += 1
                stats['errors'].append(error_msg)
            finally:
                stats['processed'] += 1

        logger.info(f"Processed {stats['processed']} integrations: {stats['succeeded']} succeeded, {stats['failed']} failed")
        return stats

    @classmethod
    def _process_single_integration(cls, queue_entry: ElicensingIntegrationQueue) -> None:
        """
        Process a single integration task.

        Args:
            queue_entry: The queue entry to process

        Raises:
            Exception: If the integration fails
        """
        obligation_id = queue_entry.compliance_obligation_id

        # Mark as processing
        queue_entry.mark_processing()

        try:
            # Attempt the elicensing integration
            ObligationELicensingService.process_obligation_integration(obligation_id)

            # Mark as completed
            queue_entry.mark_completed()

            logger.info(f"Successfully processed elicensing integration for obligation {obligation_id}")

        except Exception as e:
            # The exception will be caught by the caller and handled appropriately
            raise

    @classmethod
    def get_pending_integrations(cls) -> List[ElicensingIntegrationQueue]:
        """
        Get all integrations that are pending or failed but can be retried.

        Returns:
            List of pending integration queue entries
        """
        return list(ElicensingIntegrationQueue.objects.filter(status__in=[ElicensingIntegrationQueue.Status.PENDING, ElicensingIntegrationQueue.Status.FAILED]).select_related('compliance_obligation'))

    @classmethod
    def get_failed_integrations(cls) -> List[ElicensingIntegrationQueue]:
        """
        Get all integrations that have failed and exceeded max retries.

        Returns:
            List of failed integration queue entries
        """
        return list(ElicensingIntegrationQueue.objects.filter(status=ElicensingIntegrationQueue.Status.MAX_RETRIES_EXCEEDED).select_related('compliance_obligation'))

    @classmethod
    def reset_failed_integration(cls, queue_entry_id: int) -> ElicensingIntegrationQueue:
        """
        Reset a failed integration for manual retry.

        Args:
            queue_entry_id: The ID of the queue entry to reset

        Returns:
            The reset queue entry
        """
        queue_entry = ElicensingIntegrationQueue.objects.get(id=queue_entry_id)

        if queue_entry.status != ElicensingIntegrationQueue.Status.MAX_RETRIES_EXCEEDED:
            raise ValueError(f"Cannot reset integration with status {queue_entry.status}")

        queue_entry.status = ElicensingIntegrationQueue.Status.PENDING
        queue_entry.retry_count = 0
        queue_entry.last_error_message = None
        queue_entry.next_retry_at = None
        queue_entry.save(update_fields=['status', 'retry_count', 'last_error_message', 'next_retry_at'])

        logger.info(f"Reset failed integration {queue_entry_id} for manual retry")
        return queue_entry
