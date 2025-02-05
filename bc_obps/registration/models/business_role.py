from common.enums import Schemas
from common.models import BaseModel
from django.db import models
from simple_history.models import HistoricalRecords

from registration.enums.enums import RegistrationTableNames
from rls.rls_configs.registration.business_role import Rls as BusinessRoleRls


class BusinessRole(BaseModel):
    role_name = models.CharField(
        primary_key=True,
        serialize=False,
        db_comment='The name identifying the role assigned to a Contact. Also acts as the primary key.',
        max_length=100,
    )
    role_description = models.CharField(db_comment='Description of the business role', max_length=1000)
    history = HistoricalRecords(
        table_name='erc_history"."business_role_history',
        history_user_id_field=models.UUIDField(null=True, blank=True),
    )

    class Meta:
        db_table_comment = "This table contains the definitions for roles within the operator/operation. These roles are used to define the permissions a user has within the operator/operation."
        db_table = f'{Schemas.ERC.value}"."{RegistrationTableNames.BUSINESS_ROLE.value}'

    Rls = BusinessRoleRls
