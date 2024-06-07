from django.db import models
from registration.constants import (
    BC_CORPORATE_REGISTRY_REGEX,
    BC_CORPORATE_REGISTRY_REGEX_MESSAGE,
)
from registration.models import Address, BusinessStructure, Operation, TimeStampedModel
from simple_history.models import HistoricalRecords
from django.core.validators import RegexValidator


class MultipleOperator(TimeStampedModel):
    operation = models.ForeignKey(
        Operation,
        db_comment="The operation that this multiple operator is associated with",
        on_delete=models.DO_NOTHING,
        related_name="multiple_operator",
    )
    operator_index = models.IntegerField(
        db_comment="Index used to differentiate operators for this operation for saving/updating purposes"
    )
    legal_name = models.CharField(max_length=1000, db_comment="The legal name of an operator")
    trade_name = models.CharField(max_length=1000, db_comment="The trade name of an operator")
    cra_business_number = models.IntegerField(db_comment="The CRA business number of an operator")
    bc_corporate_registry_number = models.CharField(
        db_comment="The BC corporate registry number of an operator",
        validators=[RegexValidator(regex=BC_CORPORATE_REGISTRY_REGEX, message=BC_CORPORATE_REGISTRY_REGEX_MESSAGE)],
    )
    business_structure = models.ForeignKey(
        BusinessStructure,
        on_delete=models.DO_NOTHING,
        null=True,
        db_comment="The business structure of an operator",
        related_name="multiple_operator",
    )
    website = models.URLField(
        max_length=200,
        db_comment="The website address of an operator",
        blank=True,
        null=True,
    )
    percentage_ownership = models.DecimalField(
        decimal_places=5,
        max_digits=10,
        db_comment="The percentage of the operation which this operator owns",
        blank=True,
        null=True,
    )
    # TODO: add documents
    # proof_of_authority = models.FileField(
    #     upload_to="documents",
    #     db_comment="",
    #     blank=True,
    #     null=True,
    # )
    physical_address = models.ForeignKey(
        Address,
        on_delete=models.DO_NOTHING,
        db_comment="The physical address of an operator (where the operator is physically located)",
        related_name="multiple_operator_physical",
    )
    mailing_address = models.ForeignKey(
        Address,
        on_delete=models.DO_NOTHING,
        db_comment="The mailing address of an operator",
        related_name="multiple_operator_mailing",
        blank=True,
        null=True,
    )
    mailing_address_same_as_physical = models.BooleanField(
        db_comment="Whether or not the mailing address is the same as the physical address", default=True
    )
    history = HistoricalRecords(
        table_name='erc_history"."multiple_operator_history',
        history_user_id_field=models.UUIDField(null=True, blank=True),
    )

    class Meta:
        db_table_comment = "Table containing data about operations' operators. An operation's designated (primary) operator has a record in the Operator table (this information has been submitted by someone who works for that operator). Any additional operators are stored in this table (additional operator information has been submitted by a user who works for a different operator, so this user should not have access to the Operator table record)."
        db_table = 'erc"."multiple_operator'
