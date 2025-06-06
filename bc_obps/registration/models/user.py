import typing
from django.db import models
from common.enums import Schemas
from registration.constants import USER_CACHE_PREFIX
from registration.enums.enums import RegistrationTableNames
from registration.models import UserAndContactCommonInfo, AppRole
from registration.models.time_stamped_model import TimeStampedModel
from simple_history.models import HistoricalRecords
from django.core.cache import cache
from registration.models.rls_configs.user import Rls as UserRls


class User(UserAndContactCommonInfo, TimeStampedModel):
    user_guid = models.UUIDField(primary_key=True, db_comment="A GUID to identify the user")
    business_guid = models.UUIDField(db_comment="A GUID to identify the business")
    bceid_business_name = models.CharField(
        max_length=1000,
        db_comment="The name of the business the user is associated with as per their Business BCeID account",
    )
    app_role = models.ForeignKey(
        AppRole,
        on_delete=models.DO_NOTHING,
        related_name="users",
        db_comment="The role assigned to this user which defines the permissions the use has.",
    )
    history = HistoricalRecords(
        table_name='erc_history"."user_history',
        history_user_id_field=models.UUIDField(null=True, blank=True),
    )

    class Meta(TimeStampedModel.Meta):
        db_table_comment = "Table containing information about app users. Industry users are all associated with a business and are identified via their Business BCEID."
        db_table = f'{Schemas.ERC.value}"."{RegistrationTableNames.USER.value}'

        constraints = [
            models.UniqueConstraint(
                fields=["user_guid", "business_guid"],
                name="uuid_user_and_business_constraint",
            )
        ]

    Rls = UserRls

    def is_irc_user(self) -> bool:
        """
        Return whether the user is an IRC user.
        """
        return self.app_role.role_name in AppRole.get_authorized_irc_roles()

    def is_industry_user(self) -> bool:
        """
        Return whether the user is an industry user.
        """
        return self.app_role.role_name == "industry_user"

    def is_cas_analyst(self) -> bool:
        """
        Return whether the user is a CAS analyst.
        """
        return self.app_role.role_name == "cas_analyst"

    def is_cas_director(self) -> bool:
        """
        Return whether the user is a CAS director.
        """
        return self.app_role.role_name == "cas_director"

    @typing.no_type_check
    def save(self, *args, **kwargs) -> None:
        """
        Override the save method to clear the cache when the user is saved.
        """
        cache_key = f"{USER_CACHE_PREFIX}{self.user_guid}"
        cache.delete(cache_key)
        super().save(*args, **kwargs)

    def __str__(self) -> str:
        return f"{self.user_guid} - {self.email} - {self.app_role.role_name}"
