import json
from django.test import TestCase
from service.form_builder_service import FormBuilderService
from reporting.tests.service.test_report_activity_save_service.infrastructure import TestInfrastructure
from model_bakery.baker import make_recipe
from reporting.service.report_activity_validation_service import ReportActivityValidationService

class TestReportActivityValidationService(TestCase):
    def setUp(self):
        self.GSC_ACTIVTY_ID = 1
        self.ti = TestInfrastructure.build()

        activity_schema = json.loads(
            FormBuilderService.build_form_schema(self.GSC_ACTIVTY_ID, self.ti.report_version, source_type_ids)
        )['schema']
