import typing
from uuid import UUID
from django.db import models

from common.constants import AUDIT_FIELDS


class BaseModel(models.Model):
    """
    Abstract base class for all models in the app.
    This class adds a save method that calls full_clean before saving.
    """

    class Meta:
        abstract = True

    @typing.no_type_check
    def save(self, *args, **kwargs) -> None:
        # if `update_fields` is passed, we only clean them otherwise we clean all fields(except audit fields)
        # This is to optimize the performance of the save method by only validating the fields that are being updated
        fields_to_update = kwargs.get('update_fields')
        if fields_to_update:
            self.full_clean(
                exclude=[field.name for field in self._meta.fields if field.name not in fields_to_update]
            )  # validate the model before saving
        else:
            self.full_clean(exclude=AUDIT_FIELDS)  # validate the model before saving
        super().save(*args, **kwargs)

    def custom_update_or_create(self, user_guid: UUID, **kwargs):
        # Extract pk or id from kwargs if available
        pk = kwargs.pop('pk', None)
        kwargs_id = kwargs.pop('id', None)

        # Use pk if available, otherwise use id
        identifier = pk if pk is not None else kwargs_id

        # breakpoint()
        # If no identifier is provided, create a new instance
        if identifier is None:

            instance, _ = self.objects.create(**kwargs), True
        else:
            # If identifier is provided, update or create the instance
            instance, _ = self.objects.update_or_create(pk=identifier, defaults=kwargs)
        # If the model has audit columns, set them
        from registration.models.time_stamped_model import TimeStampedModel

        if isinstance(instance, TimeStampedModel):
            instance.set_create_or_update(user_guid)
        return instance
