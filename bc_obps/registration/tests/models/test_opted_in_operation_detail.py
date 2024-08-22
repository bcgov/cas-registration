from common.tests.utils.helpers import BaseTestCase
from registration.models.opted_in_operation_detail import OptedInOperationDetail


class OptedInOperationDetailModelTest(BaseTestCase):
    @classmethod
    def setUpTestData(cls):
        cls.test_object = OptedInOperationDetail.objects.create()
        cls.field_data = [
            ("id", "ID", None, None),
            ("operation", "operation", None, None),
            ("meets_section_3_emissions_requirements", "meets section 3 emissions requirements", None, None),
            ("meets_electricity_import_operation_criteria", "meets electricity import operation criteria", None, None),
            ("meets_entire_operation_requirements", "meets entire operation requirements", None, None),
            ("meets_section_6_emissions_requirements", "meets section 6 emissions requirements", None, None),
            (
                "meets_naics_code_11_22_562_classification_requirements",
                "meets naics code 11 22 562 classification requirements",
                None,
                None,
            ),
            (
                "meets_producing_gger_schedule_a1_regulated_product",
                "meets producing gger schedule a1 regulated product",
                None,
                None,
            ),
            ("meets_reporting_and_regulated_obligations", "meets reporting and regulated obligations", None, None),
            (
                "meets_notification_to_director_on_criteria_change",
                "meets notification to director on criteria change",
                None,
                None,
            ),
            ("created_at", "created at", None, None),
            ("updated_at", "updated at", None, None),
            ("archived_at", "archived at", None, None),
            ("created_by", "created by", None, None),
            ("updated_by", "updated by", None, None),
            ("archived_by", "archived by", None, None),
        ]
