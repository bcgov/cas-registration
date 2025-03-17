from typing import List
import typing
import uuid
from django.core.cache import cache
from django.db import models
from common.constants import PERMISSION_CONFIGS_CACHE_KEY
from common.enums import Schemas
from registration.enums.enums import RegistrationTableNames
from registration.models import TimeStampedModel, User, Operator
from simple_history.models import HistoricalRecords
from registration.models.rls_configs.user_operator import Rls as UserOperatorRls


class UserOperator(TimeStampedModel):
    class Roles(models.TextChoices):
        ADMIN = "admin", "Admin"
        REPORTER = "reporter", "Reporter"
        PENDING = "pending", "Pending"

    class Statuses(models.TextChoices):
        PENDING = "Pending"
        APPROVED = "Approved"
        DECLINED = "Declined"

    id = models.UUIDField(
        primary_key=True, default=uuid.uuid4, db_comment="Primary key to identify the user operator", verbose_name="ID"
    )
    user_friendly_id = models.IntegerField(
        null=True, blank=True, db_comment="A user-friendly ID to identify the user operator"
    )
    user = models.ForeignKey(
        User,
        on_delete=models.DO_NOTHING,
        related_name="user_operators",
        db_comment="A user associated with an operator",
    )
    operator = models.ForeignKey(
        Operator,
        on_delete=models.DO_NOTHING,
        db_comment="An operator associated with a user",
        related_name="user_operators",
    )
    role = models.CharField(
        max_length=1000,
        choices=Roles.choices,
        default=Roles.PENDING,
        db_comment="The role of a user associated with an operator (e.g. admin)",
    )
    status = models.CharField(
        max_length=1000,
        choices=Statuses.choices,
        default=Statuses.PENDING,
        db_comment="The status of a user operator in the app (e.g. pending review)",
    )
    verified_at = models.DateTimeField(
        db_comment="The time a user operator was verified by an IRC user",
        blank=True,
        null=True,
    )
    verified_by = models.ForeignKey(
        User,
        on_delete=models.DO_NOTHING,
        db_comment="The IRC user who verified the user operator",
        blank=True,
        null=True,
        related_name="user_operators_verified_by",
    )
    history = HistoricalRecords(
        table_name='erc_history"."user_operator_history',
        history_user_id_field=models.UUIDField(null=True, blank=True),
    )

    class Meta(TimeStampedModel.Meta):
        db_table_comment = "Through table to connect Users and Operators and track access requests"
        db_table = f'{Schemas.ERC.value}"."{RegistrationTableNames.USER_OPERATOR.value}'

        constraints = [
            models.UniqueConstraint(
                fields=["user", "operator"],
                name="user_and_operator_unique_constraint",
            )
        ]

    Rls = UserOperatorRls

    @staticmethod
    def get_all_industry_user_operator_roles() -> List[str]:
        """
        Return all UserOperator.role options
        """
        return UserOperator.Roles.values

    @typing.no_type_check
    def save(self, *args, **kwargs):
        # Add a user_friendly_id to the UserOperator if it doesn't already have one
        if not self.user_friendly_id:
            self.user_friendly_id = UserOperator.objects.count() + 1
        cache.delete(PERMISSION_CONFIGS_CACHE_KEY)  # Clear the cache when a user operator is saved
        super().save(*args, **kwargs)

    @typing.no_type_check
    def delete(self, *args, **kwargs):
        cache.delete(PERMISSION_CONFIGS_CACHE_KEY)  # Clear the cache when a user operator is deleted
        super().delete(*args, **kwargs)
