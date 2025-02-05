from common.enums import Schemas
from common.models import BaseModel
from django.db import models
from simple_history.models import HistoricalRecords
from registration.enums.enums import RegistrationTableNames
from registration.models.rls_configs.document_type import Rls as DocumentTypeRls


class DocumentType(BaseModel):
    name = models.CharField(
        max_length=1000,
        db_comment="Name of document type (e.g. opt in signed statutory declaration)",
    )
    history = HistoricalRecords(
        table_name='erc_history"."document_type_history',
        history_user_id_field=models.UUIDField(null=True, blank=True),
    )

    class Meta:
        db_table_comment = "Table that contains types of documents."
        db_table = f'{Schemas.ERC.value}"."{RegistrationTableNames.DOCUMENT_TYPE.value}'

    Rls = DocumentTypeRls
