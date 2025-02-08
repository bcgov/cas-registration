import typing
from typing import List
from django.core.cache import cache
from common.constants import PERMISSION_CONFIGS_CACHE_KEY
from common.enums import Schemas
from common.models import BaseModel
from django.db import models
from simple_history.models import HistoricalRecords
from registration.enums.enums import RegistrationTableNames
from registration.models.rls_configs.app_role import Rls as AppRoleRls


class AppRole(BaseModel):
    role_name = models.CharField(
        primary_key=True,
        serialize=False,
        db_comment='The name identifying the role assigned to a user. This role defines their permissions within the app. Also acts as the primary key.',
        max_length=100,
    )
    role_description = models.CharField(db_comment='Description of the app role', max_length=1000)
    history = HistoricalRecords(
        table_name='erc_history"."app_role_history',
        history_user_id_field=models.UUIDField(null=True, blank=True),
    )

    class Meta:
        db_table_comment = "This table contains the definitions for roles within the BCIERs apps. These roles are used to define the permissions a user has within BCIERs apps."
        db_table = f'{Schemas.ERC.value}"."{RegistrationTableNames.APP_ROLE.value}'

    Rls = AppRoleRls

    # We need try/except blocks here because the app_role table may not exist yet when we run migrations
    @staticmethod
    def get_authorized_irc_roles() -> List[str]:
        """
        Return the roles that are considered as authorized CAS users (excluding cas_pending).
        """
        try:
            return list(
                AppRole.objects.filter(role_name__startswith='cas_')
                .values_list('role_name', flat=True)
                .exclude(role_name='cas_pending')
            )
        except Exception:
            return []

    @staticmethod
    def get_all_app_roles() -> List[str]:
        """
        Return all the roles in the app.
        """
        try:
            return list(AppRole.objects.values_list("role_name", flat=True))
        except Exception:
            return []

    @staticmethod
    def get_all_authorized_app_roles() -> List[str]:
        """
        Return all the roles in the app except cas_pending.
        """
        try:
            return list(AppRole.objects.exclude(role_name="cas_pending").values_list("role_name", flat=True))
        except Exception:
            return []

    @typing.no_type_check
    def save(self, *args, **kwargs):
        """
        Override the save method to clear the cache when the app role is saved.
        """
        cache.delete(PERMISSION_CONFIGS_CACHE_KEY)  # Clear the cache when an app role is saved
        super().save(*args, **kwargs)

    @typing.no_type_check
    def delete(self, *args, **kwargs):
        """
        Override the delete method to clear the cache when the app role is deleted.
        """
        cache.delete(PERMISSION_CONFIGS_CACHE_KEY)
        super().delete(*args, **kwargs)
