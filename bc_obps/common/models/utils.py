from uuid import UUID
from registration.models.time_stamped_model import TimeStampedModel


def set_audit_fields_if_needed(instance, user_guid: UUID):
    if isinstance(instance, TimeStampedModel):
        instance.set_create_or_update(user_guid)
