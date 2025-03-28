import logging
import time
from typing import Any, Dict, List, Union
from django.core.exceptions import ValidationError
from django.db.models.signals import m2m_changed, pre_save, post_save
from django.dispatch import receiver
from registration.models.document import Document
from registration.models.event.closure_event import ClosureEvent
from registration.models.event.restart_event import RestartEvent
from registration.models.event.temporary_shutdown_event import TemporaryShutdownEvent
from registration.models.event.transfer_event import TransferEvent
from service.data_access_service.document_service import DocumentDataAccessService

# List of models to apply the same signal handling logic
event_models: List[Any] = [ClosureEvent, RestartEvent, TemporaryShutdownEvent, TransferEvent]

logger = logging.getLogger(__name__)


def validate_event_constraints(
    instance: Union[ClosureEvent, RestartEvent, TemporaryShutdownEvent, TransferEvent]
) -> None:
    """
    Validates that the given event instance does not have both an operation and facilities set simultaneously.
    Raises:
        ValidationError: If the event has both an operation and facilities set.
    """
    if instance.operation and instance.facilities.exists():
        raise ValidationError("An event cannot have both an operation and facilities.")


def create_m2m_signal_handler(model: Union[ClosureEvent, RestartEvent, TemporaryShutdownEvent, TransferEvent]) -> None:
    """
    Creates and registers an m2m_changed signal handler for the specified model to validate
    that the event does not have both an operation and facilities set simultaneously.
    """

    @receiver(
        m2m_changed,
        sender=model.facilities.through,
        weak=False,
        dispatch_uid=f"{model.__class__.__name__}_m2m_facilities_changed",
    )
    def validate_facilities_m2m_constraint(
        sender: Any,
        instance: Union[ClosureEvent, RestartEvent, TemporaryShutdownEvent, TransferEvent],
        action: str,
        **kwargs: Dict,
    ) -> None:
        """
        Signal handler to validate that the event does not have both an operation and facilities set simultaneously
        when changes are made to the ManyToMany relationship with facilities.

        Args:
            sender: The model class.
            instance: The instance of the model that triggered the signal.
            action: The action being performed (e.g., 'post_add', 'post_remove', 'post_clear').
            **kwargs: Additional keyword arguments.

        Raises:
            ValidationError: If the event has both an operation and facilities set.
        """
        if action in ['post_add', 'post_remove', 'post_clear']:
            validate_event_constraints(instance)


def create_pre_save_signal_handler(
    model: Union[ClosureEvent, RestartEvent, TemporaryShutdownEvent, TransferEvent]
) -> None:
    """
    Creates and registers a pre_save signal handler for the specified model to validate
    that the event does not have both an operation and facilities set simultaneously before saving.
    """

    @receiver(pre_save, sender=model, weak=False, dispatch_uid=f"{model.__class__.__name__}_pre_save")
    def validate_operation_and_facilities_constraint(
        sender: Union[ClosureEvent, RestartEvent, TemporaryShutdownEvent, TransferEvent],
        instance: Union[ClosureEvent, RestartEvent, TemporaryShutdownEvent, TransferEvent],
        **kwargs: Dict,
    ) -> None:
        """
        Signal handler to validate that the event does not have both an operation and facilities set simultaneously
        before saving the model instance.

        Args:
            sender: The model class.
            instance: The instance of the model that triggered the signal.
            **kwargs: Additional keyword arguments.

        Raises:
            ValidationError: If the event has both an operation and facilities set.
        """
        validate_event_constraints(instance)


# Dynamically connect the signal handlers for each model
for event_model in event_models:
    create_m2m_signal_handler(event_model)
    create_pre_save_signal_handler(event_model)

# Numbers have been chosen based on a 25mb file taking ~19 seconds to scan
MAX_RETRIES = 16  # Number of times to retry if file isn't found
RETRY_DELAY = 1.5  # Delay between retries in seconds


@receiver(post_save, sender=Document)
def check_document_file_status(
    sender: Any,
    instance: Any,
    **kwargs: Any,
) -> None:
    """When a new document is created, check its status after scanning. Retries if the file is still in the unscanned bucket."""

    if instance.status != Document.FileStatus.UNSCANNED:
        return

    for attempt in range(1, MAX_RETRIES + 1):
        try:
            newStatus = DocumentDataAccessService.check_document_file_status(instance)
            if newStatus == Document.FileStatus.CLEAN or newStatus == Document.FileStatus.QUARANTINED:
                logger.info(f"Document {instance.id} status updated to {newStatus}.")
                break  # Stop retrying, file has been scanned
            else:
                logger.info(f"Attempt {attempt}: Document {instance.id} still unscanned.")

        except Exception as e:
            logger.error(f"Error checking file status for Document {instance.id}: {str(e)}")

        if attempt < MAX_RETRIES:
            time.sleep(RETRY_DELAY)  # Wait before retrying

    # If the file is still unscanned, raise an exception
    if instance.status == Document.FileStatus.UNSCANNED:
        raise Exception(
            f'Document "{instance.file.name}" with id {instance.id} unable to be processed, please check the file and try again.'
        )
