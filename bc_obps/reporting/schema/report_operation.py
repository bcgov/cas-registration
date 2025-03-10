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
            'registration_purpose',
            'operation_type',
            'operation_bcghgid',
            'bc_obps_regulated_operation_id',
            'activities',
            'regulated_products',
        ]


class ReportOperationRepresentativeSchema(ModelSchema):
    class Meta:
        model = ReportOperationRepresentative
        fields = ["id", "representative_name", "selected_for_report"]


class ReportOperationSchemaOut(ReportOperationOut):
    report_operation_representatives: List[ReportOperationRepresentativeSchema]
    operation_representative_name: List[int]  # IDs of selected representatives
    operation_report_type: str


class ReportOperationIn(Schema):
    """
    Schema for the save report operation endpoint request input
    """

    operator_legal_name: str
    operator_trade_name: Optional[str] = None
    operation_name: str
    operation_type: str
    registration_purpose: str
    operation_bcghgid: Optional[str] = None
    bc_obps_regulated_operation_id: str
    activities: List[int]
    regulated_products: List[int]
    operation_report_type: str
    operation_representative_name: List[int]
