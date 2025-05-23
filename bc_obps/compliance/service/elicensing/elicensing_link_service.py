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
        cls,
        model_class: Type[T],
        object_id: str | uuid.UUID | int,
        elicensing_object_kind: str = ELicensingLink.ObjectKind.CLIENT,
    ) -> Optional[ELicensingLink]:
        """
        Get an eLicensing link for any model and object type.

        Args:
            model_class: The model class of the related object
            object_id: The ID of the related object (can be UUID, int, or str)
            elicensing_object_kind: The kind of eLicensing object (defaults to CLIENT)

        Returns:
            The ELicensingLink object if found, None otherwise
        """
        content_type = ContentType.objects.get_for_model(cast(models.Model, model_class))
        try:
            return ELicensingLink.objects.get(
                content_type=content_type, object_id=str(object_id), elicensing_object_kind=elicensing_object_kind
            )
        except ELicensingLink.DoesNotExist:
            return None

    @classmethod
    def create_link(
        cls,
        model_instance: models.Model,
        elicensing_object_id: str,
        elicensing_object_kind: str,
        elicensing_guid: uuid.UUID,
    ) -> ELicensingLink:
        """
        Creates a link between a model instance and an eLicensing object.

        Args:
            model_instance: The model instance to link
            elicensing_object_id: The eLicensing object ID
            elicensing_object_kind: The kind of eLicensing object
            elicensing_guid: The eLicensing GUID

        Returns:
            The created ELicensingLink object
        """
        content_type = ContentType.objects.get_for_model(model_instance)
        return ELicensingLink.objects.create(
            content_type=content_type,
            object_id=str(getattr(model_instance, 'id')),
            elicensing_object_id=elicensing_object_id,
            elicensing_object_kind=elicensing_object_kind,
            elicensing_guid=elicensing_guid,
        )
