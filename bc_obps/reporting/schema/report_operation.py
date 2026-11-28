from uuid import UUID

from ninja import ModelSchema, Schema
from pydantic import alias_generators
from registration.schema import RegulatedProductSchema
from reporting.models import ReportOperationRepresentative
from reporting.models.report_operation import ReportOperation


class ReportOperationOut(ModelSchema):
    """
    Schema for the get report operation endpoint request output
    """

    class Meta:
        alias_generator = alias_generators.to_snake
        model = ReportOperation
        fields = [
            "operator_legal_name",
            "operator_trade_name",
            "operation_name",
            "registration_purpose",
            "operation_type",
            "operation_bcghgid",
            "operation_opted_out_final_reporting_year",
            "bc_obps_regulated_operation_id",
            "activities",
            "regulated_products",
        ]


class ReportOperationRepresentativeSchema(ModelSchema):
    class Meta:
        model = ReportOperationRepresentative
        fields = ["id", "representative_name", "selected_for_report"]


class ReportOperationSchemaOut(ReportOperationOut):
    report_operation_representatives: list[ReportOperationRepresentativeSchema]
    operation_representative_name: list[int]  # IDs of selected representatives
    operation_report_type: str
    operation_report_status: str
    operation_id: UUID
    naics_code: str | None = None


class FacilityReportSchema(Schema):
    facility_id: UUID
    operation_type: str


class ReportOperationIn(Schema):
    """
    Schema for the save report operation endpoint request input
    """

    operator_legal_name: str
    operator_trade_name: str | None = None
    operation_name: str
    operation_type: str
    registration_purpose: str
    operation_bcghgid: str | None = None
    bc_obps_regulated_operation_id: str
    activities: list[int]
    regulated_products: list[int]
    operation_report_type: str
    operation_representative_name: list[int]


class ActivitySchema(Schema):
    id: int
    name: str
    applicable_to: str
    regulated_name: str


class ReportOperationDataSchema(Schema):
    report_operation: ReportOperationSchemaOut
    facility_id: UUID | None
    all_activities: list[ActivitySchema]
    all_regulated_products: list[RegulatedProductSchema]
    all_representatives: list[ReportOperationRepresentativeSchema]
    report_type: str
    show_regulated_products: bool
    show_boro_id: bool
    show_activities: bool
    reporting_year: int
    is_sync_allowed: bool
    reported_product_ids: list[int]
