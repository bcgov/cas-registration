from typing import Optional

from reporting.models import ReportVersion, ReportAdditionalData
from reporting.schema.report_additional_data import (
    ReportAdditionalDataOut,
    CaptureEmissionSchema,
    AdditionalDataSectionSchema,
    ReportAdditionalDataIn,
)


class ReportAdditionalDataService:
    @staticmethod
    def get_report_report_additional_data(
        report_version_id: int,
    ) -> Optional[ReportAdditionalDataOut]:
        # Fetch the report additional data for the given report version ID
        report_additional_data = ReportAdditionalData.objects.filter(report_version__id=report_version_id).first()

        if report_additional_data is None:
            return None

        # Determine the capture type based on the attributes of report additional data
        capture_type = []
        if report_additional_data.emissions_on_site_use is not None:
            capture_type.append("On-site use")
        if report_additional_data.emissions_on_site_sequestration is not None:
            capture_type.append("On-site sequestration")
        if report_additional_data.emissions_off_site_transfer is not None:
            capture_type.append("Off-site transfer")

        # Fetch the registration purpose of the associated report
        registration_purpose = (
            ReportVersion.objects.select_related("report", "report__operation")
            .get(id=report_version_id)
            .report.operation.registration_purpose
        )

        # Prepare the additional data section if the conditions are met
        additional_data_section = (
            {"electricity_generated": report_additional_data.electricity_generated}
            if registration_purpose == "OBPS Regulated Operation" and report_additional_data.electricity_generated
            else None
        )

        # Construct and return a ReportAdditionalDataOut instance
        return ReportAdditionalDataOut(
            captured_emissions_section=CaptureEmissionSchema(
                capture_emissions=report_additional_data.capture_emissions,
                capture_type=capture_type,
                emissions_on_site_use=report_additional_data.emissions_on_site_use,
                emissions_on_site_sequestration=report_additional_data.emissions_on_site_sequestration,
                emissions_off_site_transfer=report_additional_data.emissions_off_site_transfer,
            ),
            additional_emissions_section=(
                AdditionalDataSectionSchema(electricity_generated=additional_data_section["electricity_generated"])
                if additional_data_section
                else None
            ),
        )

    @staticmethod
    def get_registration_purpose_by_version_id(version_id: int) -> dict:

        registration_purpose = (
            ReportVersion.objects.select_related('report', 'report__operation')
            .get(id=version_id)
            .report.operation.registration_purpose
        )
        return {"registration_purpose": registration_purpose}

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
