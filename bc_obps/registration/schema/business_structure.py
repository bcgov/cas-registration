from ninja import ModelSchema
from registration.models import BusinessStructure


class BusinessStructureOut(ModelSchema):
    class Meta:
        model = BusinessStructure
        fields = '__all__'
