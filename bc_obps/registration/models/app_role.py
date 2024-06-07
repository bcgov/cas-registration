from typing import List
from common.models import BaseModel
from django.db import models
from simple_history.models import HistoricalRecords


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
        db_table = 'erc"."app_role'

    # We need try/except blocks here because the app_role table may not exist yet when we run migrations
    @staticmethod
    def get_authorized_irc_roles() -> List[str]:
        """
        Return the roles that are considered as authorized CAS users (excluding cas_pending).
        """
        try:
            return list(
                AppRole.objects.filter(role_name__in=["cas_admin", "cas_analyst"]).values_list("role_name", flat=True)
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
