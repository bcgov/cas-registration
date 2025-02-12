from common.enums import Schemas
from common.models import BaseModel
from django.db import models
from localflavor.ca.models import CAPostalCodeField, CAProvinceField
from simple_history.models import HistoricalRecords

from registration.enums.enums import RegistrationTableNames
from registration.models.rls_configs.address import Rls as AddressRls


class Address(BaseModel):
    street_address = models.CharField(
        max_length=1000, null=True, blank=True, db_comment="Street address of relevant location)"
    )
    municipality = models.CharField(
        max_length=1000, null=True, blank=True, db_comment="Municipality of relevant location"
    )
    province = CAProvinceField(
        db_comment="Province of the relevant location, restricted to two-letter province postal abbreviations",
        null=True,
        blank=True,
    )
    postal_code = CAPostalCodeField(
        db_comment="Postal code of relevant location, limited to valid Canadian postal codes", null=True, blank=True
    )
    history = HistoricalRecords(
        table_name='erc_history"."address_history',
        history_user_id_field=models.UUIDField(null=True, blank=True),
    )

    class Meta:
        db_table_comment = "Table containing address data. Only Canadian addresses are supported."
        db_table = f'{Schemas.ERC.value}"."{RegistrationTableNames.ADDRESS.value}'

    Rls = AddressRls
