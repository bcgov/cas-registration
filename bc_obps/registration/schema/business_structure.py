from ninja import ModelSchema
from registration.models import BusinessStructure


def validate_business_structure(value: str) -> BusinessStructure:
    """
    Validate that the business structure is a valid BusinessStructure value.
    """
    try:
        return BusinessStructure.objects.get(name=value)
    except KeyError:
        raise ValueError(f"{value} is not a valid business structure.")


class BusinessStructureOut(ModelSchema):
    class Meta:
        model = BusinessStructure
        fields = ["name"]
