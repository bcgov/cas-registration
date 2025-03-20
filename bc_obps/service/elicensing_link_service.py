import logging
import uuid
from typing import Optional, TypeVar, Type, cast

from django.db import models
from django.contrib.contenttypes.models import ContentType
from compliance.models.elicensing_link import ELicensingLink

logger = logging.getLogger(__name__)

T = TypeVar('T', bound=models.Model)  # Type variable for related object type


class ELicensingLinkService:
    """
    Service for managing ELicensingLink records.
    This service handles the database operations for the links between system objects
    and their corresponding objects in the eLicensing system.
    """

    @classmethod
    def get_link_for_model(
        cls, model_class: Type[T], object_id: uuid.UUID, elicensing_object_kind: str = ELicensingLink.ObjectKind.CLIENT
    ) -> Optional[ELicensingLink]:
        """
        Get an eLicensing link for any model and object type.

        Args:
            model_class: The model class of the related object
            object_id: The UUID of the related object
            elicensing_object_kind: The kind of eLicensing object (defaults to CLIENT)

        Returns:
            The ELicensingLink object if found, None otherwise
        """
        content_type = ContentType.objects.get_for_model(cast(models.Model, model_class))
        try:
            return ELicensingLink.objects.get(
                content_type=content_type, object_id=object_id, elicensing_object_kind=elicensing_object_kind
            )
        except ELicensingLink.DoesNotExist:
            return None
