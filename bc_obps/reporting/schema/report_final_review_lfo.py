from typing import List, Optional
from ninja import ModelSchema

from registration.models import Operation
from reporting.models import (
    ReportVersion,
    FacilityReport
)
from reporting.schema.compliance_data import ComplianceDataSchemaOut
from reporting.schema.emission_category import EmissionSummarySchemaOut
from reporting.schema.report_final_review import ReportOperationSchema, ReportPersonResponsibleOut, \
    ReportAdditionalDataSchema, ReportElectricityImportDataSchema, ReportNewEntrantSchema
from reporting.service.compliance_service import ComplianceService, ComplianceData
from reporting.service.emission_category_service import EmissionCategoryService
from service.report_version_service import ReportVersionService


class FacilityReportSchema(ModelSchema):
    class Meta:
        model = FacilityReport
        fields = ['facility', 'facility_name', 'id']


class ReportVersionSchemaForLFO(ModelSchema):
    report_operation: Optional[ReportOperationSchema] = None
    report_person_responsible: Optional[ReportPersonResponsibleOut] = None
    report_additional_data: Optional[ReportAdditionalDataSchema] = None
    report_electricity_import_data: List[ReportElectricityImportDataSchema] = []
    report_new_entrant: List[ReportNewEntrantSchema] = []
    facility_reports: List[FacilityReportSchema] = []
    report_compliance_summary: Optional[ComplianceDataSchemaOut] = None
    operation_emission_summary: Optional[EmissionSummarySchemaOut] = None
    is_supplementary_report: Optional[bool] = None

    @staticmethod
    def resolve_report_compliance_summary(obj: ReportVersion) -> Optional[ComplianceData]:
        if (
                hasattr(obj, 'report_operation')
                and obj.report_operation
                and obj.report_operation.registration_purpose == Operation.Purposes.ELECTRICITY_IMPORT_OPERATION
        ):
            return None
        return ComplianceService.get_calculated_compliance_data(obj.id)

    @staticmethod
    def resolve_operation_emission_summary(obj: ReportVersion) -> Optional[dict]:
        if (
                hasattr(obj, 'report_operation')
                and obj.report_operation
                and obj.report_operation.operation_type == Operation.Types.LFO
        ):
            return EmissionCategoryService.get_operation_emission_summary_form_data(obj.id)
        return None

    @staticmethod
    def resolve_is_supplementary_report(obj: ReportVersion) -> bool:
        return not ReportVersionService.is_initial_report_version(obj.id)

    class Meta:
        model = ReportVersion
        fields = ['report_type', 'is_latest_submitted', 'reason_for_change', 'status']
