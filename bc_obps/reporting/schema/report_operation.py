from ninja import ModelSchema
from reporting.models.report_operation import ReportOperation
from pydantic import alias_generators
from typing import List


def to_camel(string: str) -> str:
    return alias_generators.to_camel(string)


def to_snake(string: str) -> str:
    return alias_generators.to_snake(string)


class ReportOperationOut(ModelSchema):
    """
    Schema for the get report operation endpoint request output
    """

    class Config:
        alias_generator = to_snake

    class Meta:
        model = ReportOperation
        fields = [
            'operator_legal_name',
            'operator_trade_name',
            'operation_name',
            'operation_type',
            'operation_bcghgid',
            'bc_obps_regulated_operation_id',
            'reporting_activities',
            'regulated_products',
            'operation_representative_name',
        ]


class ReportOperationIn(ModelSchema):
    """
    Schema for the save report operation endpoint request input
    """

    operator_legal_name: str
    operator_trade_name: str
    operation_name: str
    operation_type: str
    operation_bcghgid: str
    bc_obps_regulated_operation_id: str
    reporting_activities: List[str]
    regulated_products: List[str]
    operation_representative_name: str

    class Config:
        alias_generator = to_snake

    class Meta:
        model = ReportOperation
        fields = [
            'operator_legal_name',
            'operator_trade_name',
            'operation_name',
            'operation_type',
            'operation_bcghgid',
            'bc_obps_regulated_operation_id',
            'reporting_activities',
            'regulated_products',
            'operation_representative_name',
        ]
