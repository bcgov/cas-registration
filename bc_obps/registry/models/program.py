from common.enums import Schemas
from django.db import models
from registry.enums.enums import RegistryTableNames
from common.models.base_model import BaseModel
from registry.models.rls_configs.program import Rls as ProgramRls


class Program(BaseModel):
    id = models.PositiveIntegerField(primary_key=True)
    name = models.CharField(max_length=200)

    class Meta:
        db_table_comment = "Table containing basic information about programs that are administered through the BC Carbon Registry"
        db_table = f'{Schemas.ERC.value}"."{RegistryTableNames.PROGRAM.value}'

    Rls = ProgramRls
