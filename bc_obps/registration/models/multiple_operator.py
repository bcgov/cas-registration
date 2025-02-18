from django.db import models
from common.enums import Schemas
from registration.constants import (
    BC_CORPORATE_REGISTRY_REGEX,
    BC_CORPORATE_REGISTRY_REGEX_MESSAGE,
)
from registration.enums.enums import RegistrationTableNames
from registration.models import Address, BusinessStructure, Operation, TimeStampedModel
from simple_history.models import HistoricalRecords
from django.core.validators import RegexValidator
from registration.models.rls_configs.multiple_operator import Rls as MultipleOperatorRls


class MultipleOperator(TimeStampedModel):
    operation = models.ForeignKey(
        Operation,
        db_comment="The operation that this multiple operator is associated with",
        on_delete=models.DO_NOTHING,
        related_name="multiple_operators",
    )
    legal_name = models.CharField(max_length=1000, db_comment="The legal name of an operator")
    trade_name = models.CharField(max_length=1000, db_comment="The trade name of an operator")
    cra_business_number = models.IntegerField(db_comment="The CRA business number of an operator")
    bc_corporate_registry_number = models.CharField(
        db_comment="The BC corporate registry number of an operator",
        validators=[RegexValidator(regex=BC_CORPORATE_REGISTRY_REGEX, message=BC_CORPORATE_REGISTRY_REGEX_MESSAGE)],
        null=True,
        blank=True,
    )
    business_structure = models.ForeignKey(
        BusinessStructure,
        on_delete=models.DO_NOTHING,
        null=True,
        db_comment="The business structure of an operator",
        related_name="multiple_operators",
    )
    attorney_address = models.ForeignKey(
        Address,
        on_delete=models.DO_NOTHING,
        db_comment="The address of the operator's attorney",
        related_name="multiple_operators",
        blank=True,
        null=True,
    )
    history = HistoricalRecords(
        table_name='erc_history"."multiple_operator_history',
        history_user_id_field=models.UUIDField(null=True, blank=True),
    )

    class Meta(TimeStampedModel.Meta):
        db_table_comment = "Table containing data about operations' operators. An operation's designated (primary) operator has a record in the Operator table (this information has been submitted by someone who works for that operator). Any additional operators are stored in this table (additional operator information has been submitted by a user who works for a different operator, so this user should not have access to the Operator table record)."
        db_table = f'{Schemas.ERC.value}"."{RegistrationTableNames.MULTIPLE_OPERATOR.value}'

    Rls = MultipleOperatorRls
