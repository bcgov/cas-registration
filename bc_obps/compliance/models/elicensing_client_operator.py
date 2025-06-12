from django.db import models
from registration.models.time_stamped_model import TimeStampedModel
from registration.models import Operator
from .rls_configs.elicensing_client_operator import Rls as ElicensingClientOperatorRls
from django.core.exceptions import MultipleObjectsReturned


class GetOneOrNoneManager(models.Manager):
    """Return one record, None if no record exists, raise if multiple records returned"""

    def get_one_or_none(self, *args, **kwargs):  # type: ignore[no-untyped-def]
        try:
            return self.get(*args, **kwargs)
        except (self.model.DoesNotExist):  # type: ignore[attr-defined]
            return None
        except (self.model.MultipleObjectsReturned):  # type: ignore[attr-defined]
            raise MultipleObjectsReturned


class ElicensingClientOperator(TimeStampedModel):
    """
    Model the relationship between an Operator record in BCIERS and the related client in elicensing.

    """

    managed_objects = GetOneOrNoneManager()

    client_object_id = models.IntegerField(
        db_comment="The clientObjectId identifier from elicensing for the related client"
    )

    client_guid = models.CharField(db_comment="The clientGuid identifier from elicensing for the related client")

    operator = models.ForeignKey(
        Operator,
        on_delete=models.PROTECT,
        related_name="+",
        db_comment="Foreign key to the BCIERS operator object for this record",
    )

    class Meta(TimeStampedModel.Meta):
        app_label = "compliance"
        db_table_comment = "A table to define the relationship between a BCIERS Operator record and the corresponding client record in elicensing"
        db_table = 'erc"."elicensing_client_operator'

    Rls = ElicensingClientOperatorRls
