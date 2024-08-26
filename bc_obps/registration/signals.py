from typing import Any, Dict, List, Union
from django.core.exceptions import ValidationError
from django.db.models.signals import m2m_changed, pre_save
from django.dispatch import receiver
from registration.models.event.closure_event import ClosureEvent
from registration.models.event.restart_event import RestartEvent
from registration.models.event.temporary_shutdown_event import TemporaryShutdownEvent
from registration.models.event.transfer_event import TransferEvent

# List of models to apply the same signal handling logic
event_models: List[Any] = [ClosureEvent, RestartEvent, TemporaryShutdownEvent, TransferEvent]


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

    @receiver(m2m_changed, sender=model.facilities.through)
    def validate_facilities_m2m_constraint(
        sender: Any,
        instance: Union[ClosureEvent, RestartEvent, TemporaryShutdownEvent, TransferEvent],
        action: str,
        **kwargs: Dict
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

    @receiver(pre_save, sender=model)
    def validate_operation_and_facilities_constraint(
        sender: Union[ClosureEvent, RestartEvent, TemporaryShutdownEvent, TransferEvent],
        instance: Union[ClosureEvent, RestartEvent, TemporaryShutdownEvent, TransferEvent],
        **kwargs: Dict
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
