from typing import Optional
from ninja import ModelSchema, Schema
from registration.models.bc_greenhouse_gas_id import BcGreenhouseGasId


class BcghgIdOut(ModelSchema):
    class Meta:
        model = BcGreenhouseGasId
        fields = ['id']


class BcghgIdIn(Schema):
    bcghg_id: Optional[str] = None
