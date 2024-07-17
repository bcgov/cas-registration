from ninja import Schema
from typing import List


class ReportOperationOut(Schema):
    """
    Schema for the get report operation endpoint request output
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


class ReportOperationIn(Schema):
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
