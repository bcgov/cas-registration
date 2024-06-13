import typing
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
