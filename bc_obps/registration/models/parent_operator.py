from django.db import models
from registration.constants import (
    BC_CORPORATE_REGISTRY_REGEX,
    BC_CORPORATE_REGISTRY_REGEX_MESSAGE,
)
from registration.models import TimeStampedModel, Operator, BusinessStructure, Address
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
        db_comment="Index used to differentiate parent operators for the child operator for saving/updating purposes"
    )
    legal_name = models.CharField(max_length=1000, db_comment="The legal name of an operator")
    trade_name = models.CharField(max_length=1000, blank=True, db_comment="The trade name of an operator")
    cra_business_number = models.IntegerField(db_comment="The CRA business number of an operator")
    bc_corporate_registry_number = models.CharField(
        db_comment="The BC corporate registry number of an operator",
        validators=[RegexValidator(regex=BC_CORPORATE_REGISTRY_REGEX, message=BC_CORPORATE_REGISTRY_REGEX_MESSAGE)],
    )
    business_structure = models.ForeignKey(
        BusinessStructure,
        on_delete=models.DO_NOTHING,
        db_comment="The business structure of an operator",
        related_name="parent_operators",
    )
    website = models.URLField(
        max_length=200,
        db_comment="The website address of an operator",
        blank=True,
        null=True,
    )
    physical_address = models.ForeignKey(
        Address,
        on_delete=models.DO_NOTHING,
        db_comment="The physical address of an operator (where the operator is physically located)",
        related_name="parent_operators_physical",
    )
    mailing_address = models.ForeignKey(
        Address,
        on_delete=models.DO_NOTHING,
        db_comment="The mailing address of an operator",
        related_name="parent_operators_mailing",
        blank=True,
        null=True,
    )
    history = HistoricalRecords(
        table_name='erc_history"."parent_operator_history',
        history_user_id_field=models.UUIDField(null=True, blank=True),
    )

    class Meta:
        db_table_comment = "Table containing data about operators' parent operators. Parent operators may have a record in the Operator table. If so, that record is controlled by someone who works for that parent operator. The information in this table is controlled by child operators who should not have access to other operator's records."
        db_table = 'erc"."parent_operator'
        indexes = [
            models.Index(fields=["child_operator"], name="po_child_operator_idx"),
            models.Index(fields=["business_structure"], name="po_business_structure_idx"),
            models.Index(fields=["physical_address"], name="po_physical_address_idx"),
            models.Index(fields=["mailing_address"], name="po_mailing_address_idx"),
        ]
