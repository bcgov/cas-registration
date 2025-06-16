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
)
from reporting.schema.compliance_data import ComplianceDataSchemaOut
from reporting.service.compliance_service import ComplianceService, ComplianceData
from reporting.service.emission_category_service import EmissionCategoryService


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

    @staticmethod
    def resolve_activity(obj: ReportRawActivityData) -> Optional[str]:
        return obj.activity.name if obj.activity else None

    class Meta:
        model = ReportRawActivityData
        fields = ['activity', 'json_data']


class ReportOperationSchema(ModelSchema):
    activities: str
    regulated_products: str
    representatives: str

    @staticmethod
    def resolve_representatives(obj: ReportOperation) -> str:
        return ", ".join(representative.representative_name for representative in obj.representatives.all())

    @staticmethod
    def resolve_activities(obj: ReportOperation) -> str:
        return ", ".join(activity.name for activity in obj.activities.all())

    @staticmethod
    def resolve_regulated_products(obj: ReportOperation) -> str:
        return ", ".join(product.name for product in obj.regulated_products.all())

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

    @staticmethod
    def resolve_product(obj: ReportProduct) -> Optional[str]:
        return obj.product.name if obj.product else None

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
    raw_activity_data: List[ReportRawActivityDataSchema] = []
    report_products: List[ReportProductionDataSchema] = []
    reportnonattributableemissions_records: List[ReportNonAttributableEmissionSchema] = []
    emission_summary: Optional[Any] = None
    reportemissionallocation_records: List[ReportEmissionAllocationSchema] = []

    @staticmethod
    def resolve_raw_activity_data(obj: FacilityReport) -> List[ReportRawActivityData]:
        return list(obj.reportrawactivitydata_records.all())

    @staticmethod
    def resolve_emission_summary(obj: FacilityReport) -> Optional[Any]:
        return EmissionCategoryService.get_facility_emission_summary_form_data(obj.id)

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
    reportemissionallocation_records: List[ReportEmissionAllocationSchema] = []

    @staticmethod
    def resolve_report_compliance_summary(obj: ReportVersion) -> ComplianceData:
        return ComplianceService.get_calculated_compliance_data(obj.id)

    class Meta:
        model = ReportVersion
        fields = ['id', 'report_type', 'is_latest_submitted', 'reason_for_change', 'status']
