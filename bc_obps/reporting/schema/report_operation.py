from ninja import ModelSchema, Schema

from reporting.models import ReportOperationRepresentative
from reporting.models.report_operation import ReportOperation
from pydantic import alias_generators

from typing import List, Optional


def to_camel(string: str) -> str:
    return alias_generators.to_camel(string)


def to_snake(string: str) -> str:
    return alias_generators.to_snake(string)


class ReportOperationOut(ModelSchema):
    """
    Schema for the get report operation endpoint request output
    """

    class Meta:
        alias_generator = to_snake
        model = ReportOperation
        fields = [
            'operator_legal_name',
            'operator_trade_name',
            'operation_name',
            'operation_type',
            'operation_bcghgid',
            'bc_obps_regulated_operation_id',
            'activities',
            'regulated_products',
        ]
        orm_mode = True


class ReportOperationRepresentativeSchema(ModelSchema):
    class Meta:
        model = ReportOperationRepresentative
        fields = ["id", "representative_name", "selected_for_report"]


class ReportOperationSchemaOut(Schema):
    """
    Schema for the report operation with representative details.
    """

    report_operation: ReportOperationOut
    report_operation_representatives: List[ReportOperationRepresentativeSchema]


class ReportOperationIn(Schema):
    """
    Schema for the save report operation endpoint request input
    """

    operator_legal_name: str
    operator_trade_name: Optional[str] = None
    operation_name: str
    operation_type: str
    operation_bcghgid: str
    bc_obps_regulated_operation_id: str
    activities: List[str]
    regulated_products: List[str]
    operation_report_type: str
    operation_representative_name: List[int]
