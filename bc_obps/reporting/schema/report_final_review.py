from typing import List, Optional
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
    ActivityJsonSchema,
    ReportOperationRepresentative,
    ReportRawActivityData,
)
from registration.models.activity import Activity


# Nested Schemas for Activity and ActivityJsonSchema
class ActivitySchema(ModelSchema):
    class Meta:
        model = Activity
        fields = ["id", "name"]  # Add other relevant fields


class ReportRawActivityDataSchema(ModelSchema):
    class Meta:
        model = ReportRawActivityData
        fields = "__all__"


class ActivityJsonSchemaSchema(ModelSchema):
    class Config:
        model = ActivityJsonSchema
        model_fields = ['id', 'activity', 'json_schema', 'valid_from', 'valid_to']


class ReportOperationSchema(ModelSchema):
    class Meta:
        model = ReportOperation
        fields = "__all__"


class ReportOperationRepresentativeSchema(ModelSchema):
    class Meta:
        model = ReportOperationRepresentative
        fields = ['representative_name', 'selected_for_report']


class ReportActivitySchema(ModelSchema):
    class Meta:
        model = ReportActivity
        fields = ['json_data', 'activity', 'activity_base_schema', 'report_version', 'facility_report']


class ReportComplianceSummarySchema(ModelSchema):
    class Meta:
        model = ReportComplianceSummary
        fields = "__all__"


class FacilityReportSchema(ModelSchema):
    raw_activity_data: List[ReportRawActivityDataSchema] = []

    @staticmethod
    def resolve_raw_activity_data(obj: FacilityReport) -> List[ReportRawActivityData]:
        return list(obj.reportrawactivitydata_records.all())

    class Meta:
        model = FacilityReport
        fields = ['facility', 'facility_name', 'facility_type', 'facility_bcghgid', 'is_completed', 'activities']


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
    report_person_responsible: ReportPersonResponsibleOut
    report_additional_data: Optional[ReportAdditionalDataSchema] = None
    report_electricity_import_data: List[ReportElectricityImportDataSchema]
    report_new_entrant: List[ReportNewEntrantSchema] = []
    facility_reports: List[FacilityReportSchema] = []
    report_compliance_summary: List[ReportComplianceSummarySchema] = []
    report_operation_representatives: List[ReportOperationRepresentativeSchema] = []

    class Meta:
        model = ReportVersion
        fields = ['id', 'report_type', 'is_latest_submitted', 'reason_for_change', 'status']
