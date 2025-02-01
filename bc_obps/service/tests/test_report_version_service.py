from django.db.models import CASCADE, Field, Model
from model_bakery import baker
import pytest
from reporting.models.report_version import ReportVersion
from service.report_version_service import ReportVersionService

pytestmark = pytest.mark.django_db


def get_cascading_models(model: Model | Field) -> set[Model]:
    if not hasattr(model, "_meta"):
        return {}

    delete_cascade_models = {
        r.related_model for r in model._meta.get_fields() if hasattr(r, "on_delete") and r.on_delete == CASCADE
    }
    nested_models_list = [get_cascading_models(m) for m in delete_cascade_models]
    nested_models = {item for nested_list in nested_models_list for item in nested_list}

    return {*delete_cascade_models, *nested_models}


class TestReportVersionService:
    def test_create_report_version(self):
        # This functionality is tested as part of the report_service
        pass

    def test_delete_report_version(self):
        report = baker.make_recipe("reporting.tests.utils.report")
        report_version = ReportVersionService.create_report_version(report)

        assert ReportVersion.objects.filter(id=report_version.id).count() == 1
        ReportVersionService.delete_report_version(report_version.id)
        assert ReportVersion.objects.filter(id=report_version.id).count() == 0

    def test_change_report_version_type_deletes_the_old_version_and_creates_a_new_one(
        self,
    ):
        report = baker.make_recipe("reporting.tests.utils.report")
        report_version = ReportVersionService.create_report_version(report, "Annual Report")

        return_value = ReportVersionService.change_report_version_type(
            report_version_id=report_version.id, new_report_type="Simple Report"
        )

        assert ReportVersion.objects.filter(id=report_version.id).count() == 0
        assert ReportVersion.objects.filter(id=return_value.id).count() == 1
        assert return_value.report_type == "Simple Report"

    def test_change_report_version_type_to_the_same_does_nothing(self):
        report = baker.make_recipe("reporting.tests.utils.report")
        report_version = ReportVersionService.create_report_version(report, "Annual Report")

        return_value = ReportVersionService.change_report_version_type(
            report_version_id=report_version.id, new_report_type="Annual Report"
        )

        assert ReportVersion.objects.filter(id=report_version.id).count() == 1
        assert return_value == report_version

    def test_report_version_cascading_models(self):
        cascading_models_names = {m.__name__ for m in get_cascading_models(ReportVersion)}

        assert cascading_models_names == {
            "FacilityReport",
            "ReportActivity",
            "ReportAttachment",
            "ReportEmission",
            "ReportFuel",
            "ReportMethodology",
            "ReportNewEntrant",
            "ReportNewEntrantEmission",
            "ReportNewEntrantProduction",
            "ReportNonAttributableEmissions",
            "ReportOperation",
            "ReportPersonResponsible",
            "ReportProduct",
            "ReportProductEmissionAllocation",
            "ReportRawActivityData",
            "ReportSourceType",
            "ReportUnit",
            "ReportOperationRepresentative",
            "ReportAdditionalData",
            "ReportVerification",
            "ReportVerificationVisit",
            "ReportProductEmissionAllocation",
        }
