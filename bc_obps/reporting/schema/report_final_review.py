from typing import List, Optional, Any, Dict, Union
from ninja import ModelSchema
from pydantic import ConfigDict

from registration.models import Operation
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
    ReportNewEntrantEmission,
    ReportNewEntrantProduction,
    ReportingField,
)
from reporting.schema.compliance_data import ComplianceDataSchemaOut
from reporting.schema.emission_category import EmissionSummarySchemaOut
from reporting.schema.report_emission_allocation import ReportEmissionAllocationSchemaOut
from reporting.service.compliance_service import ComplianceService
from reporting.service.compliance_service.compliance_service import ComplianceData
from reporting.service.emission_category_service import EmissionCategoryService
from reporting.service.report_emission_allocation_service import (
    ReportEmissionAllocationService,
    ReportEmissionAllocationData,
)
from service.report_version_service import ReportVersionService


class EmissionCategorySchema(ModelSchema):
    class Meta:
        model = EmissionCategory
        fields = ['category_name', 'category_type']


class ReportProductSchema(ModelSchema):
    name: str
    unit: str

    @staticmethod
    def resolve_name(obj: ReportProduct) -> Optional[str]:
        return obj.product.name if obj.product.name else None

    @staticmethod
    def resolve_unit(obj: ReportProduct) -> Optional[str]:
        return obj.product.unit if obj.product.unit else None

    class Meta:
        model = ReportProduct
        fields = ['product']


class ReportProductEmissionAllocationSchema(ModelSchema):
    report_product: ReportProductSchema
    emission_category: EmissionCategorySchema
    products: Dict[str, ReportProductSchema] = {}

    @staticmethod
    def resolve_products(obj: ReportProductEmissionAllocation) -> Optional[ReportProduct]:
        product = getattr(obj, 'product', None)
        return product

    class Meta:
        model = ReportProductEmissionAllocation
        fields = ['report_product', 'emission_category', 'allocated_quantity']


class ReportComplianceSummarySchema(ModelSchema):
    class Meta:
        model = ReportComplianceSummary
        fields = "__all__"


class ReportEmissionAllocationSchema(ModelSchema):
    report_product_emission_allocations: Dict[str, ReportProductEmissionAllocationSchema] = {}
    report_product_emission_allocation_totals: Dict[str, ReportProductSchema] = {}

    @staticmethod
    def resolve_report_product_emission_allocations(
        obj: ReportEmissionAllocation,
    ) -> Dict[str, ReportProductEmissionAllocation]:
        allocations = obj.reportproductemissionallocation_records.all()
        return {allocation.emission_category.category_name: allocation for allocation in allocations}

    @staticmethod
    def resolve_report_product_emission_allocation_totals(obj: ReportEmissionAllocation) -> Dict[str, ReportProduct]:
        totals = getattr(obj, 'allocation_totals', [])
        return {
            f"product:{total.product_name}" if hasattr(total, 'product_name') else f"total_{total.id}": total
            for total in totals
        }

    class Meta:
        model = ReportEmissionAllocation
        fields = ['allocation_methodology', 'allocation_other_methodology_description']


def get_reporting_field_display_titles() -> Dict[str, str]:
    field_titles: Dict[str, str] = {}

    for reporting_field in ReportingField.objects.only(
        "slug",
        "field_display_title",
        "field_name",
    ):
        display_title = reporting_field.field_display_title or reporting_field.field_name

        # Main reporting field
        field_titles[reporting_field.slug] = display_title

        # Generated "...FieldUnits" companion field
        field_titles[f"{reporting_field.slug}FieldUnits"] = f"{display_title} Units"

    return field_titles


def add_methodology_display_titles(
    value: Any,
    field_titles: Dict[str, str],
) -> Any:
    if isinstance(value, dict):
        updated = {key: add_methodology_display_titles(child_value, field_titles) for key, child_value in value.items()}

        # Detect methodology blocks
        if "methodology" in updated and isinstance(updated["methodology"], str):
            display_titles = {key: field_titles[key] for key in updated.keys() if key in field_titles}

            if display_titles:
                updated["_field_display_titles"] = display_titles

        return updated

    if isinstance(value, list):
        return [add_methodology_display_titles(item, field_titles) for item in value]

    return value


class ReportRawActivityDataSchema(ModelSchema):
    activity: str
    source_types: dict

    @staticmethod
    def resolve_activity(obj: ReportRawActivityData) -> Optional[str]:
        return obj.activity.name if obj.activity else None

    @staticmethod
    def resolve_source_types(obj: ReportRawActivityData) -> dict:
        json_data = obj.json_data

        field_titles = get_reporting_field_display_titles()

        json_data = add_methodology_display_titles(json_data, field_titles)

        source_type_section = json_data.get("sourceTypes", {})
        source_type_section_keys = set(source_type_section.keys())

        resolved_source_types = {}
        for key, value in source_type_section.items():
            source_type = SourceType.objects.filter(json_key=key).first()
            resolved_source_types[source_type.name if source_type else key] = value

        source_type_json_keys = set(
            SourceType.objects.filter(json_key__in=json_data.keys()).values_list("json_key", flat=True)
        )
        _excluded = {"sourceTypes", "id", "activity", "activityId"} | source_type_json_keys | source_type_section_keys
        other_data = {k: v for k, v in json_data.items() if k not in _excluded}
        return {**resolved_source_types, **other_data}

    class Meta:
        model = ReportRawActivityData
        fields = ['activity']


class ReportOperationSchema(ModelSchema):
    activities: str
    regulated_products: str
    representatives: str
    report_type: str
    naics_code: Optional[str] = None

    @staticmethod
    def resolve_representatives(obj: ReportOperation) -> str:
        return "; ".join(
            rep.representative_name
            for rep in obj.report_version.report_operation_representatives.filter(selected_for_report=True)
        )

    @staticmethod
    def resolve_activities(obj: ReportOperation) -> str:
        return "; ".join(activity.name for activity in obj.activities.all())

    @staticmethod
    def resolve_regulated_products(obj: ReportOperation) -> str:
        return "; ".join(product.name for product in obj.regulated_products.all())

    @staticmethod
    def resolve_report_type(obj: ReportOperation) -> str:
        return obj.report_version.report_type if obj.report_version else ""

    @staticmethod
    def resolve_naics_code(obj: ReportOperation) -> Optional[str]:
        naics = obj.naics_code
        return f"{naics.naics_code} - {naics.naics_description}" if naics else None

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
            'production_data_jan_mar',
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
    activity_data: Dict[str, ReportRawActivityDataSchema] = {}
    report_products: Dict[str, ReportProductionDataSchema] = {}
    reportnonattributableemissions_records: List[ReportNonAttributableEmissionSchema] = []
    emission_summary: Optional[EmissionSummarySchemaOut] = None
    report_emission_allocation: Optional[ReportEmissionAllocationSchemaOut] = None

    @staticmethod
    def resolve_activity_data(obj: FacilityReport) -> Dict[str, ReportRawActivityData]:
        activities = obj.reportrawactivitydata_records.all()
        return {activity.activity.name: activity for activity in activities}

    @staticmethod
    def resolve_field_display_titles(obj: FacilityReport) -> Dict[str, str]:
        return get_reporting_field_display_titles()

    @staticmethod
    def resolve_report_products(obj: FacilityReport) -> Dict[str, ReportProduct]:
        products = obj.report_products.all()
        return {product.product.name: product for product in products}

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
    model_config = ConfigDict(populate_by_name=True)

    full_address: str

    @staticmethod
    def resolve_full_address(obj: ReportPersonResponsible) -> str:
        return f"{obj.street_address}, {obj.municipality} {obj.province}, {obj.postal_code}"

    @staticmethod
    def resolve_phone_number(obj: ReportPersonResponsible) -> str:
        return str(obj.phone_number.as_international)

    class Meta:
        model = ReportPersonResponsible
        fields = [
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


class ReportNewEntrantEmissionSchema(ModelSchema):
    emission_category: str
    category_type: str
    emission: float

    @staticmethod
    def resolve_emission_category(obj: ReportNewEntrantEmission) -> Optional[str]:
        return obj.emission_category.category_name if obj.emission_category else None

    @staticmethod
    def resolve_category_type(obj: ReportNewEntrantEmission) -> Optional[str]:
        return obj.emission_category.category_type if obj.emission_category else None

    class Meta:
        model = ReportNewEntrantEmission
        fields = ['emission_category', 'emission']


class ReportProductionSchema(ModelSchema):
    product: str
    unit: str
    production_amount: float

    @staticmethod
    def resolve_product(obj: ReportNewEntrantProduction) -> Optional[str]:
        return obj.product.name if obj.product else None

    @staticmethod
    def resolve_unit(obj: ReportNewEntrantProduction) -> Optional[str]:
        return obj.product.unit if obj.product else None

    class Meta:
        model = ReportNewEntrantProduction
        fields = ['product', 'production_amount']


class ReportComplianceSummaryProductSchema(ModelSchema):
    class Meta:
        model = ReportComplianceSummaryProduct
        fields = "__all__"


class ReportNewEntrantSchema(ModelSchema):
    report_new_entrant_emission: Dict[str, ReportNewEntrantEmissionSchema] = {}
    productions: Dict[str, ReportProductionSchema] = {}

    @staticmethod
    def resolve_report_new_entrant_emission(obj: ReportNewEntrant) -> Dict[str, ReportNewEntrantEmission]:
        return {e.emission_category.category_name: e for e in obj.report_new_entrant_emission.all()}

    @staticmethod
    def resolve_productions(obj: ReportNewEntrant) -> Dict[str, ReportNewEntrantProduction]:
        return {p.product.name: p for p in obj.productions.all()}

    class Meta:
        model = ReportNewEntrant
        fields = ['authorization_date', 'first_shipment_date', 'new_entrant_period_start', 'assertion_statement']


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


class FacilityReportLFOSchema(ModelSchema):
    class Meta:
        model = FacilityReport
        fields = ['facility', 'facility_name', 'id']


class BaseReportVersionSchema(ModelSchema):
    report_operation: Optional[ReportOperationSchema] = None
    report_person_responsible: Optional[ReportPersonResponsibleOut] = None
    report_compliance_summary: Optional[ComplianceDataSchemaOut] = None
    report_additional_data: Optional[ReportAdditionalDataSchema] = None
    report_electricity_import_data: List[ReportElectricityImportDataSchema] = []
    report_new_entrant: List[ReportNewEntrantSchema] = []
    operation_emission_summary: Optional[EmissionSummarySchemaOut] = None
    is_supplementary_report: Optional[bool] = None
    reporting_year: int

    @staticmethod
    def resolve_reporting_year(obj: ReportVersion) -> int:
        return obj.report.reporting_year_id

    @staticmethod
    def resolve_report_compliance_summary(obj: ReportVersion) -> Optional[ComplianceData]:
        if obj.report_operation.registration_purpose == Operation.Purposes.ELECTRICITY_IMPORT_OPERATION:
            return None
        data = ComplianceService.get_calculated_compliance_data(obj.id)
        return data if data else None

    @staticmethod
    def resolve_operation_emission_summary(obj: ReportVersion) -> Optional[dict]:
        if obj.report_operation.operation_type == Operation.Types.LFO:
            return EmissionCategoryService.get_operation_emission_summary_form_data(obj.id)
        return None

    @staticmethod
    def resolve_is_supplementary_report(obj: ReportVersion) -> bool:
        return not ReportVersionService.is_initial_report_version(obj.id)

    class Meta:
        model = ReportVersion
        fields = ["report_type", "is_latest_submitted", "reason_for_change", "status"]


class FinalReviewVersionSchema(BaseReportVersionSchema):
    facility_reports: Union[Dict[str, FacilityReportSchema], List[FacilityReportLFOSchema]] = {}

    @staticmethod
    def resolve_facility_reports(obj: ReportVersion) -> Union[Dict[str, FacilityReport], List[FacilityReport]]:
        if obj.report_operation.operation_type == Operation.Types.EIO:
            return {}
        if obj.report_operation.operation_type == Operation.Types.LFO:
            return list(obj.facility_reports.all())

        facility = obj.facility_reports.first()
        return {facility.facility_name: facility} if facility else {}


class ReviewChangesVersionSchema(BaseReportVersionSchema):
    facility_reports: Dict[str, FacilityReportSchema] = {}

    @staticmethod
    def resolve_facility_reports(obj: ReportVersion) -> Dict[str, FacilityReport]:
        return {facility.facility_name: facility for facility in obj.facility_reports.all()}
