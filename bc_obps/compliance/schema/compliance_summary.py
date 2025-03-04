from decimal import Decimal
from typing import List, Any, Union, cast
from ninja import Schema


class ComplianceProductOut(Schema):
    """Schema for compliance product output"""

    product_name: str
    annual_production: Decimal
    apr_dec_production: Decimal
    emission_intensity: Decimal
    allocated_industrial_process_emissions: Decimal
    allocated_compliance_emissions: Decimal


class ComplianceObligationOut(Schema):
    """Schema for compliance obligation output"""

    emissions_amount_tco2e: Decimal
    status: str


class ComplianceSummaryListOut(Schema):
    """Schema for compliance summary list output"""

    id: int
    operation_name: str
    reporting_year: int
    excess_emissions: Decimal
    compliance_status: str
    obligation_id: int | None

    @staticmethod
    def resolve_operation_name(obj: Any) -> str:
        return cast(str, obj.report.operation.name)

    @staticmethod
    def resolve_reporting_year(obj: Any) -> int:
        return cast(int, obj.compliance_period.end_date.year)

    @staticmethod
    def resolve_excess_emissions(obj: Any) -> Decimal:
        return cast(Decimal, round(obj.excess_emissions))

    @staticmethod
    def resolve_obligation_id(obj: Any) -> Union[int, None]:
        return obj.obligation.id if hasattr(obj, 'obligation') and obj.obligation else None


class ComplianceSummaryOut(Schema):
    """Schema for compliance summary output"""

    id: int
    operation_name: str
    operation_bcghg_id: str
    reporting_year: int
    emissions_attributable_for_reporting: Decimal
    reporting_only_emissions: Decimal
    emissions_attributable_for_compliance: Decimal
    emission_limit: Decimal
    excess_emissions: Decimal
    credited_emissions: Decimal
    reduction_factor: Decimal
    tightening_rate: Decimal
    compliance_status: str
    products: List[ComplianceProductOut]
    obligation: ComplianceObligationOut | None

    @staticmethod
    def resolve_operation_name(obj: Any) -> str:
        return cast(str, obj.report.operation.name)

    @staticmethod
    def resolve_operation_bcghg_id(obj: Any) -> str:
        return cast(str, obj.report.operation.bcghg_id.identifier)

    @staticmethod
    def resolve_reporting_year(obj: Any) -> int:
        return cast(int, obj.compliance_period.end_date.year)

    @staticmethod
    def resolve_excess_emissions(obj: Any) -> Decimal:
        return cast(Decimal, round(obj.excess_emissions))
