import uuid
from django.db import models

from common.enums import Schemas
from registration.constants import (
    BC_CORPORATE_REGISTRY_REGEX,
    BC_CORPORATE_REGISTRY_REGEX_MESSAGE,
    CRA_BUSINESS_NUMBER_MESSAGE,
)
from registration.models import TimeStampedModel, Address, BusinessStructure, User
from registration.enums.enums import RegistrationTableNames
from simple_history.models import HistoricalRecords
from django.core.validators import RegexValidator, MaxValueValidator, MinValueValidator
from rls.rls_configs.registration.operator import Rls as OperatorRls


class Operator(TimeStampedModel):
    class Statuses(models.TextChoices):
        DRAFT = "Draft"
        PENDING = "Pending"
        APPROVED = "Approved"
        DECLINED = "Declined"
        CHANGES_REQUESTED = "Changes Requested"

    id = models.UUIDField(
        primary_key=True, default=uuid.uuid4, db_comment="Primary key to identify the operator", verbose_name="ID"
    )
    legal_name = models.CharField(max_length=1000, db_comment="The legal name of an operator", unique=True)
    trade_name = models.CharField(max_length=1000, blank=True, null=True, db_comment="The trade name of an operator")
    cra_business_number = models.IntegerField(
        validators=[
            MaxValueValidator(999999999, message=CRA_BUSINESS_NUMBER_MESSAGE),
            MinValueValidator(100000000, message=CRA_BUSINESS_NUMBER_MESSAGE),  # Assuming  9-digit number
        ],
        db_comment="The CRA business number of an operator",
    )
    swrs_organisation_id = models.IntegerField(
        db_comment="An identifier used in the CIIP/SWRS dataset (in swrs: organisation = operator). This identifier will only be populated for operators that were imported from that dataset.",
        blank=True,
        null=True,
    )
    bc_corporate_registry_number = models.CharField(
        db_comment="The BC corporate registry number of an operator",
        null=True,
        unique=True,
        validators=[RegexValidator(regex=BC_CORPORATE_REGISTRY_REGEX, message=BC_CORPORATE_REGISTRY_REGEX_MESSAGE)],
    )
    business_structure = models.ForeignKey(
        BusinessStructure,
        on_delete=models.DO_NOTHING,
        null=True,
        blank=True,
        db_comment="The business structure of an operator",
        related_name="operators",
    )
    physical_address = models.ForeignKey(
        Address,
        on_delete=models.DO_NOTHING,
        null=True,
        blank=True,
        db_comment="The physical address of an operator (where the operator is physically located)",
        related_name="operators_physical",
    )
    mailing_address = models.ForeignKey(
        Address,
        on_delete=models.DO_NOTHING,
        db_comment="The mailing address of an operator",
        related_name="operators_mailing",
        blank=True,
        null=True,
    )
    website = models.URLField(
        max_length=200,
        db_comment="The website address of an operator",
        blank=True,
        null=True,
    )
    status = models.CharField(
        max_length=1000,
        choices=Statuses.choices,
        default=Statuses.DRAFT,
        db_comment="The status of an operator in the app (e.g. draft)",
    )
    verified_at = models.DateTimeField(
        db_comment="The time an operator was verified by an IRC user",
        blank=True,
        null=True,
    )
    verified_by = models.ForeignKey(
        User,
        on_delete=models.DO_NOTHING,
        db_comment="The IRC user who verified the operator",
        blank=True,
        null=True,
        related_name="operators_verified_by",
    )
    is_new = models.BooleanField(
        db_comment="Flag to indicate whether CAS internal staff need to explicitly approve the Operator at the same time that they're approving the request for prime admin access. (If a prime admin is requesting access to an existing operator, then the operator is not new and does need to be approved.)",
        default=True,
    )
    history = HistoricalRecords(
        table_name='erc_history"."operator_history',
        history_user_id_field=models.UUIDField(null=True, blank=True),
    )

    class Meta(TimeStampedModel.Meta):
        constraints = [
            models.UniqueConstraint(
                fields=["cra_business_number"],
                name="cra_business_number_unique_constraint",
            )
        ]
        db_table_comment = "Table containing operator information. An operator is the person who owns and/or controls and directs industrial operations. An operator can own multiple operations. For more information see definitions in the Greenhouse Gas Industrial Reporting and Control Act: https://www.bclaws.gov.bc.ca/civix/document/id/complete/statreg/14029_01#section1: https://www.bclaws.gov.bc.ca/civix/document/id/complete/statreg/14029_01#section1"
        db_table = f'{Schemas.ERC.value}"."{RegistrationTableNames.OPERATOR.value}'

    Rls = OperatorRls

    def __str__(self) -> str:
        return f"{self.legal_name} ({self.id})"
