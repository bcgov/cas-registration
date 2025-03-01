from typing import List, Optional
from uuid import UUID
from ninja import Field
from ninja import ModelSchema
from registration.models import Operator, ParentOperator
from .parent_operator import ParentOperatorOut


class OperatorExternalDashboardUsersTileData(ModelSchema):
    """
    Schema for fields from the Operator model that are needed in ExternalDashboardUsersTileData
    """

    class Meta:
        model = Operator
        fields = ["legal_name"]


class OperatorForOperationOut(ModelSchema):
    """
    Schema specifically for the operator field in the OperationOut schema
    This is used to optimize the queries and reduce the number of queries
    """

    physical_street_address: Optional[str] = Field(None, alias="physical_address.street_address")
    physical_municipality: Optional[str] = Field(None, alias="physical_address.municipality")
    physical_province: Optional[str] = Field(None, alias="physical_address.province")
    physical_postal_code: Optional[str] = Field(None, alias="physical_address.postal_code")
    mailing_street_address: Optional[str] = Field(None, alias="mailing_address.street_address")
    mailing_municipality: Optional[str] = Field(None, alias="mailing_address.municipality")
    mailing_province: Optional[str] = Field(None, alias="mailing_address.province")
    mailing_postal_code: Optional[str] = Field(None, alias="mailing_address.postal_code")
    mailing_address_same_as_physical: bool
    operator_has_parent_operators: bool
    parent_operators_array: Optional[List[ParentOperatorOut]] = None

    @staticmethod
    def resolve_parent_operators_array(obj: Operator) -> Optional[List[ParentOperator]]:
        if obj.parent_operators.exists():
            return [
                parent_operator
                for parent_operator in obj.parent_operators.select_related(
                    "physical_address", "mailing_address", "business_structure"
                )
            ]
        return None

    @staticmethod
    def resolve_mailing_address_same_as_physical(obj: Operator) -> bool:
        if not obj.mailing_address or not obj.physical_address:
            return False
        return obj.mailing_address_id == obj.physical_address_id

    @staticmethod
    def resolve_operator_has_parent_operators(obj: Operator) -> bool:
        return obj.parent_operators.exists()

    class Meta:
        model = Operator
        fields = [
            "id",
            "legal_name",
            "trade_name",
            "cra_business_number",
            "bc_corporate_registry_number",
            "business_structure",
            "website",
        ]


class OperatorFromUserOperatorOut(ModelSchema):
    """
    Schema for the Operator associated with a UserOperator
    """

    operator_id: UUID = Field(..., alias="id")

    class Meta:
        model = Operator
        fields = ["status"]
