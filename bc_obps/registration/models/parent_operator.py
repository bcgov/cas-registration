from django.db import models
from registration.models.operator import Operator
from registration.constants import (
    BC_CORPORATE_REGISTRY_REGEX,
    BC_CORPORATE_REGISTRY_REGEX_MESSAGE,
)
from registration.models import TimeStampedModel, BusinessStructure, Address
from simple_history.models import HistoricalRecords
from django.core.validators import RegexValidator


class ParentOperator(TimeStampedModel):
    child_operator = models.ForeignKey(
        Operator,
        db_comment="The operator that this parent operator is associated with",
        on_delete=models.DO_NOTHING,
        related_name="parent_operators",
    )
    operator_index = models.IntegerField(
        db_comment="Index used to differentiate parent operators for the child operator for saving/updating purposes",
        blank=True,
        null=True,
    )
    legal_name = models.CharField(max_length=1000, db_comment="The legal name of a parent operator")
    trade_name = models.CharField(
        max_length=1000, blank=True, null=True, db_comment="The trade name of a parent operator"
    )
    cra_business_number = models.IntegerField(
        db_comment="The CRA business number of a parent operator", blank=True, null=True
    )
    foreign_tax_id_number = models.CharField(
        max_length=1000,
        db_comment="The tax ID of a non-Canadian parent operator (non-Canadian operators won't have a CRA business number)",
        blank=True,
        null=True,
    )
    bc_corporate_registry_number = models.CharField(
        db_comment="The BC corporate registry number of a parent operator",
        validators=[RegexValidator(regex=BC_CORPORATE_REGISTRY_REGEX, message=BC_CORPORATE_REGISTRY_REGEX_MESSAGE)],
        blank=True,
        null=True,
    )
    business_structure = models.ForeignKey(
        BusinessStructure,
        on_delete=models.DO_NOTHING,
        db_comment="The business structure of a parent operator",
        related_name="parent_operators",
        blank=True,
        null=True,
    )
    website = models.URLField(
        max_length=200,
        db_comment="The website address of a parent operator",
        blank=True,
        null=True,
    )
    physical_address = models.ForeignKey(
        Address,
        on_delete=models.DO_NOTHING,
        db_comment="The physical address of a parent operator (where the operator is physically located)",
        related_name="parent_operators_physical",
        blank=True,
        null=True,
    )
    mailing_address = models.ForeignKey(
        Address,
        on_delete=models.DO_NOTHING,
        db_comment="The mailing address of a parent operator",
        related_name="parent_operators_mailing",
        blank=True,
        null=True,
    )
    foreign_address = models.CharField(
        max_length=2000,
        db_comment="The address of a non-Canadian parent operator (Canadian operators will have a record in the address table, which only supports Canadian addresses)",
        null=True,
        blank=True,
    )
    history = HistoricalRecords(
        table_name='erc_history"."parent_operator_history',
        history_user_id_field=models.UUIDField(null=True, blank=True),
    )

    class Meta(TimeStampedModel.Meta):
        db_table_comment = "Table containing data about operators' parent operators. Parent operators may have a record in the Operator table. If so, that record is controlled by someone who works for that parent operator. The information in this table is controlled by child operators who should not have access to other operator's records."
        db_table = 'erc"."parent_operator'
