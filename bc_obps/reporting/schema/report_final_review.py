from typing import List, Optional, Any
from ninja import ModelSchema
from reporting.models import (
    ReportVersion,
    FacilityReport,
    ReportComplianceSummary,
    ReportComplianceSummaryProduct,
    ReportElectricityImportData,
    ReportAdditionalData,
    ReportOperation,
    ReportPersonResponsible,
    ReportNewEntrant,
    ReportActivity,
    ReportRawActivityData,
    ReportNonAttributableEmissions,
    ReportProduct,
    ReportEmissionAllocation,
    ReportProductEmissionAllocation,
    EmissionCategory,
    SourceType,
)
from reporting.schema.compliance_data import ComplianceDataSchemaOut
from reporting.service.compliance_service import ComplianceService, ComplianceData
from reporting.service.emission_category_service import EmissionCategoryService
from reporting.service.report_emission_allocation_service import (
    ReportEmissionAllocationService,
    ReportEmissionAllocationData,
)
from service.report_version_service import ReportVersionService


class EmissionCategorySchema(ModelSchema):
    class Meta:
        model = EmissionCategory
        fields = ['id', 'category_name', 'category_type']


class ReportProductSchema(ModelSchema):
    product: str

    @staticmethod
    def resolve_product(obj: ReportProduct) -> Optional[str]:
        return obj.product.name if obj.product.name else None

    class Meta:
        model = ReportProduct
        fields = ['product']


class ReportProductEmissionAllocationSchema(ModelSchema):
    report_product: ReportProductSchema
    emission_category: EmissionCategorySchema

    class Meta:
        model = ReportProductEmissionAllocation
        fields = ['report_product', 'emission_category', 'allocated_quantity']


class ReportComplianceSummarySchema(ModelSchema):
    class Meta:
        model = ReportComplianceSummary
        fields = "__all__"


class ReportEmissionAllocationSchema(ModelSchema):
    reportproductemissionallocation_records: List[ReportProductEmissionAllocationSchema] = []

    class Meta:
        model = ReportEmissionAllocation
        fields = ['allocation_methodology', 'allocation_other_methodology_description']


class ReportRawActivityDataSchema(ModelSchema):
    activity: str
    source_types: dict

    @staticmethod
    def resolve_activity(obj: ReportRawActivityData) -> Optional[str]:
        return obj.activity.name if obj.activity else None

    @staticmethod
    def resolve_source_types(obj: ReportRawActivityData) -> dict:
        source_types = obj.json_data.get("sourceTypes", {})
        resolved_source_types = {}
        for key, value in source_types.items():
            source_type = SourceType.objects.filter(json_key=key).first()
            resolved_source_types[source_type.name if source_type else key] = value
        return resolved_source_types

    class Meta:
        model = ReportRawActivityData
        fields = ['activity']


class ReportOperationSchema(ModelSchema):
    activities: str
    regulated_products: str
    representatives: str
    report_type: str

    @staticmethod
    def resolve_representatives(obj: ReportOperation) -> str:
        return "; ".join(rep.representative_name for rep in obj.report_version.report_operation_representatives.all())

    @staticmethod
    def resolve_activities(obj: ReportOperation) -> str:
        return "; ".join(activity.name for activity in obj.activities.all())

    @staticmethod
    def resolve_regulated_products(obj: ReportOperation) -> str:
        return "; ".join(product.name for product in obj.regulated_products.all())

    @staticmethod
    def resolve_report_type(obj: ReportOperation) -> str:
        return obj.report_version.report_type if obj.report_version else ""

    class Meta:
        model = ReportOperation
        fields = [
            'operator_legal_name',
            'operator_trade_name',
            'operation_name',
            'operation_type',
            'operation_bcghgid',
            'bc_obps_regulated_operation_id',
            'registration_purpose',
        ]


class ReportProductionDataSchema(ModelSchema):
    product: str
    unit: str

    @staticmethod
    def resolve_product(obj: ReportProduct) -> Optional[str]:
        return obj.product.name if obj.product else None

    @staticmethod
    def resolve_unit(obj: ReportProduct) -> Optional[str]:
        return obj.product.unit if obj.product else None

    class Meta:
        model = ReportProduct
        fields = [
            'annual_production',
            'product',
            'annual_production',
            'production_data_apr_dec',
            'production_methodology',
            'production_methodology_description',
            'storage_quantity_start_of_period',
            'storage_quantity_end_of_period',
            'quantity_sold_during_period',
            'quantity_throughput_during_period',
        ]


class ReportActivitySchema(ModelSchema):
    class Meta:
        model = ReportActivity
        fields = ['json_data', 'activity', 'activity_base_schema', 'report_version', 'facility_report']


class ReportNonAttributableEmissionSchema(ModelSchema):
    gas_type: str
    emission_category: str

    @staticmethod
    def resolve_gas_type(obj: ReportNonAttributableEmissions) -> str:
        return ", ".join(gt.chemical_formula for gt in obj.gas_type.all())

    @staticmethod
    def resolve_emission_category(obj: ReportNonAttributableEmissions) -> Optional[str]:
        return obj.emission_category.category_name if obj.emission_category else None

    class Meta:
        model = ReportNonAttributableEmissions
        fields = ['gas_type', 'emission_category', 'activity', 'source_type']


class FacilityReportSchema(ModelSchema):
    activity_data: List[ReportRawActivityDataSchema] = []
    report_products: List[ReportProductionDataSchema] = []
    reportnonattributableemissions_records: List[ReportNonAttributableEmissionSchema] = []
    emission_summary: Optional[Any] = None
    report_emission_allocation: Optional[Any] = None

    @staticmethod
    def resolve_activity_data(obj: FacilityReport) -> List[ReportRawActivityData]:
        return list(obj.reportrawactivitydata_records.all())

    @staticmethod
    def resolve_emission_summary(obj: FacilityReport) -> Optional[Any]:
        return EmissionCategoryService.get_facility_emission_summary_form_data(obj.id)

    @staticmethod
    def resolve_report_emission_allocation(obj: FacilityReport) -> ReportEmissionAllocationData:
        return ReportEmissionAllocationService.get_emission_allocation_data(obj.report_version.pk, obj.facility.pk)

    class Meta:
        model = FacilityReport
        fields = [
            'facility',
            'facility_name',
            'facility_type',
            'facility_bcghgid',
        ]


class ReportPersonResponsibleOut(ModelSchema):
    @staticmethod
    def resolve_phone_number(obj: ReportPersonResponsible) -> str:
        return str(obj.phone_number)

    class Meta:
        model = ReportPersonResponsible
        populate_by_name = True
        fields = [
            'street_address',
            'municipality',
            'province',
            'postal_code',
            'first_name',
            'phone_number',
            'last_name',
            'email',
            'position_title',
            'business_role',
            'report_version',
        ]


class ReportAdditionalDataSchema(ModelSchema):
    class Meta:
        model = ReportAdditionalData
        fields = [
            'capture_emissions',
            'emissions_on_site_use',
            'emissions_on_site_sequestration',
            'emissions_off_site_transfer',
            'electricity_generated',
        ]


class ReportComplianceSummaryProductSchema(ModelSchema):
    class Meta:
        model = ReportComplianceSummaryProduct
        fields = "__all__"


class ReportNewEntrantSchema(ModelSchema):
    class Meta:
        model = ReportNewEntrant
        fields = "__all__"


class ReportElectricityImportDataSchema(ModelSchema):
    class Meta:
        model = ReportElectricityImportData
        fields = [
            'import_specified_electricity',
            'import_specified_emissions',
            'import_unspecified_electricity',
            'import_unspecified_emissions',
            'export_specified_electricity',
            'export_specified_emissions',
            'export_unspecified_electricity',
            'export_unspecified_emissions',
            'canadian_entitlement_electricity',
            'canadian_entitlement_emissions',
        ]


class ReportVersionSchema(ModelSchema):
    report_operation: ReportOperationSchema
    report_person_responsible: Optional[ReportPersonResponsibleOut] = None
    report_additional_data: Optional[ReportAdditionalDataSchema] = None
    report_electricity_import_data: List[ReportElectricityImportDataSchema]
    report_new_entrant: List[ReportNewEntrantSchema] = []
    facility_reports: List[FacilityReportSchema] = []
    report_compliance_summary: Optional[ComplianceDataSchemaOut] = None
    is_supplementary_report: Optional[bool] = None

    @staticmethod
    def resolve_report_compliance_summary(obj: ReportVersion) -> ComplianceData:
        return ComplianceService.get_calculated_compliance_data(obj.id)

    @staticmethod
    def resolve_is_supplementary_report(obj: ReportVersion) -> bool:
        return not ReportVersionService.is_initial_report_version(obj.id)

    class Meta:
        model = ReportVersion
        fields = ['id', 'report_type', 'is_latest_submitted', 'reason_for_change', 'status']
