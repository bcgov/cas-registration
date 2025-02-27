from typing import Optional

from reporting.models import ReportVersion, ReportAdditionalData
from reporting.schema.report_additional_data import (
    ReportAdditionalDataIn,
)


class ReportAdditionalDataService:
    @staticmethod
    def get_report_report_additional_data(
        report_version_id: int,
    ) -> Optional[ReportAdditionalData]:
        return ReportAdditionalData.objects.filter(report_version__id=report_version_id).first()

    @staticmethod
    def save_report_additional_data(version_id: int, data: ReportAdditionalDataIn) -> ReportAdditionalData:
        report_version = ReportVersion.objects.get(pk=version_id)
        report_additional_data, created = ReportAdditionalData.objects.update_or_create(
            report_version=report_version,
            defaults={
                "capture_emissions": data.capture_emissions,
                "emissions_on_site_use": data.emissions_on_site_use,
                "emissions_on_site_sequestration": data.emissions_on_site_sequestration,
                "emissions_off_site_transfer": data.emissions_off_site_transfer,
                "electricity_generated": data.electricity_generated,
            },
        )

        return report_additional_data
