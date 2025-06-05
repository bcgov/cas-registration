from abc import ABC, abstractmethod
from typing import Generic, TypeVar
from reporting.models import (
    ReportVersion,
    FacilityReport,
    ReportComplianceSummary,
    ReportComplianceSummaryProduct,
    ReportElectricityImportData,
)

TSerialized = TypeVar("TSerialized")


class BaseSerializer(ABC, Generic[TSerialized]):
    @classmethod
    @abstractmethod
    def serialize(cls, obj: TSerialized) -> dict | list[dict]:
        raise NotImplementedError("BaseSerializer.serialize : This is an abstract method that should be overridden.")


class FacilityReportSerializer(BaseSerializer[FacilityReport]):
    @classmethod
    def serialize(cls, obj: FacilityReport) -> dict:
        return {
            "id": obj.id,
            "facility_id": obj.facility_id,
            **obj.json_data,
        }


class ReportComplianceSummarySerializer(BaseSerializer[ReportComplianceSummary]):
    @classmethod
    def serialize(cls, obj: ReportComplianceSummary) -> dict:
        return {
            "id": obj.id,
            **obj.json_data,
        }


class ReportComplianceSummaryProductSerializer(BaseSerializer[ReportComplianceSummaryProduct]):
    @classmethod
    def serialize(cls, obj: ReportComplianceSummaryProduct) -> dict:
        return {
            "id": obj.id,
            **obj.json_data,
        }


class ReportElectricityImportDataSerializer(BaseSerializer[ReportElectricityImportData]):
    @classmethod
    def serialize(cls, obj: ReportElectricityImportData) -> dict:
        return {
            "id": obj.id,
            **obj.json_data,
        }


class ReportVersionSerializer(BaseSerializer[ReportVersion]):
    @classmethod
    def serialize(cls, obj: ReportVersion) -> dict:
        return {
            "id": obj.id,
            "name": obj.name,
            "status": obj.status,
            **obj.json_data,  # optional: in case ReportVersion has json_data
            "facility_reports": [FacilityReportSerializer.serialize(fr) for fr in obj.facility_reports.all()],
            "report_compliance_summary": [
                ReportComplianceSummarySerializer.serialize(r) for r in obj.report_compliance_summary.all()
            ],
            "report_compliance_summary_products": [
                ReportComplianceSummaryProductSerializer.serialize(r)
                for r in obj.report_compliance_summary_products.all()
            ],
            "report_electricity_import_data": [
                ReportElectricityImportDataSerializer.serialize(r) for r in obj.report_electricity_import_data.all()
            ],
        }
