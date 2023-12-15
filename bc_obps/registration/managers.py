from typing import Any
from django.db import models, transaction
from django.db.models.utils import resolve_callables

"""
Note that add(), update(), remove(), clear(), set()
all apply database changes immediately for all types of related fields.
In other words, there is no need to call save() on either end of the relationship.
"""


class CustomManager(models.Manager):
    def create(self, **kwargs: Any) -> Any:
        """Override create method to set created_by field"""
        modifier = kwargs.pop("modifier", None)
        if not modifier:
            # Raise an exception or handle the scenario where user information is missing
            raise ValueError("User information is required to create this instance.")
        instance = self.model(**kwargs)
        instance.save(modifier=modifier)
        return instance

    def get_or_create(self, defaults=None, **kwargs):
        """Override get_or_create method to set created_by field"""
        modifier = kwargs.pop("modifier", None)  # We have to pop this off so that we don't pass it to self.get()
        defaults = defaults or {}
        defaults.update(kwargs)
        try:
            obj = self.get(**kwargs)
            created = False
        except self.model.DoesNotExist:
            if not modifier:
                raise ValueError("User information is required to create this instance.")
            obj = self.create(**defaults, modifier=modifier)
            created = True
        return obj, created

    def update_or_create(self, defaults=None, create_defaults=None, **kwargs):
        """Override update_or_create method to set modifier field"""
        modifier = kwargs.pop("modifier", None)
        if not modifier:
            raise ValueError("User information is required to update or create this instance.")

        update_defaults = defaults or {}
        if create_defaults is None:
            create_defaults = update_defaults

        obj, created = self.get_or_create(create_defaults, **kwargs, modifier=modifier)
        if created:
            return obj, created
        for k, v in resolve_callables(update_defaults):
            setattr(obj, k, v)

        update_fields = set(update_defaults)
        obj.save(modifier=modifier, update_fields=update_fields)
        return obj, False
