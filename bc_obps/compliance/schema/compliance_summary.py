from decimal import Decimal
from typing import List, Any, Union, cast
from ninja import Schema, ModelSchema

from compliance.models.compliance_product import ComplianceProduct
from compliance.models.compliance_obligation import ComplianceObligation
from compliance.models.compliance_summary import ComplianceSummary


class ComplianceProductOut(ModelSchema):
    """Schema for compliance product output"""

    product_name: str
    
    class Meta:
        model = ComplianceProduct
        fields = [
            'annual_production',
            'apr_dec_production',
            'emission_intensity',
            'allocated_industrial_process_emissions',
            'allocated_compliance_emissions',
        ]
        
    @staticmethod
    def resolve_product_name(obj: Any) -> str:
        return cast(str, obj.report_product.product.name)


class ComplianceObligationOut(ModelSchema):
    """Schema for compliance obligation output"""

    class Meta:
        model = ComplianceObligation
        fields = [
            'emissions_amount_tco2e',
            'status',
        ]


class ComplianceSummaryListOut(ModelSchema):
    """Schema for compliance summary list output"""
    
    operation_name: str
    reporting_year: int
    compliance_status: str
    obligation_id: Union[int, None]

    class Meta:
        model = ComplianceSummary
        fields = [
            'id',
            'excess_emissions',
        ]

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


class ComplianceSummaryOut(ModelSchema):
    """Schema for compliance summary output"""
    
    operation_name: str
    operation_bcghg_id: str
    reporting_year: int
    compliance_status: str
    products: List[ComplianceProductOut]
    obligation: ComplianceObligationOut

    class Meta:
        model = ComplianceSummary
        fields = [
            'id',
            'emissions_attributable_for_reporting',
            'reporting_only_emissions',
            'emissions_attributable_for_compliance',
            'emission_limit',
            'excess_emissions',
            'credited_emissions',
            'reduction_factor',
            'tightening_rate',
        ]

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
