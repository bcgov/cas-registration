from django.conf import settings
from django.db.models.base import ModelBase


class Rls(ModelBase):
    """
    Custom metaclass that enforces the implementation of the 'Rls' class in child models.
    Inherits from Django's ModelBase to avoid metaclass conflicts.
    """

    def __new__(cls, name: str, bases: tuple, dct: dict) -> type:
        # Skip check for Abstract models
        if hasattr(dct['Meta'], 'abstract') and dct['Meta'].abstract:
            return super().__new__(cls, name, bases, dct)

        if settings.RLS_FLAG is False:
            return super().__new__(cls, name, bases, dct)

        # Check if the model defines the 'Rls' class
        rls_class = dct.get('Rls', None)
        if not rls_class:
            raise NotImplementedError(f"Model {name} must implement an 'Rls' class.")

        return super().__new__(cls, name, bases, dct)
