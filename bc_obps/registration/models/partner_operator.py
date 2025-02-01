from django.db import models
from registration.models.operator import Operator
from registration.constants import (
    BC_CORPORATE_REGISTRY_REGEX,
    BC_CORPORATE_REGISTRY_REGEX_MESSAGE,
)
from registration.models import TimeStampedModel, BusinessStructure
from simple_history.models import HistoricalRecords
from django.core.validators import RegexValidator


class PartnerOperator(TimeStampedModel):
    bc_obps_operator = models.ForeignKey(
        Operator,
        db_comment="The operator that this partner operator is associated with",
        on_delete=models.DO_NOTHING,
        related_name="partner_operators",
    )
    legal_name = models.CharField(max_length=1000, db_comment="The legal name of an operator")
    trade_name = models.CharField(max_length=1000, blank=True, null=True, db_comment="The trade name of an operator")
    cra_business_number = models.IntegerField(db_comment="The CRA business number of an operator")
    bc_corporate_registry_number = models.CharField(
        db_comment="The BC corporate registry number of an operator",
        validators=[RegexValidator(regex=BC_CORPORATE_REGISTRY_REGEX, message=BC_CORPORATE_REGISTRY_REGEX_MESSAGE)],
    )
    business_structure = models.ForeignKey(
        BusinessStructure,
        on_delete=models.DO_NOTHING,
        db_comment="The business structure of an operator",
        related_name="partner_operators",
    )

    history = HistoricalRecords(
        table_name='erc_history"."partner_operator_history',
        history_user_id_field=models.UUIDField(null=True, blank=True),
    )

    class Meta(TimeStampedModel.Meta):
        db_table_comment = "Table containing data about operators' partner operators. Partner operators may have a record in the Operator table. If so, that record is controlled by someone who works for that partner operator. The information in this table is controlled by BCOBPS operators who should not have access to other operator's records."
        db_table = 'erc"."partner_operator'
