from ninja import ModelSchema
from registration.models import BusinessStructure


class BusinessStructureOut(ModelSchema):
    class Config:
        model = BusinessStructure
        model_fields = '__all__'
