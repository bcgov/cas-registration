from decimal import Decimal
from reporting.models.emission_category import EmissionCategory
from reporting.models.report_product_emission_allocation import ReportProductEmissionAllocation
from common.tests.utils.helpers import BaseTestCase
from registration.tests.constants import TIMESTAMP_COMMON_FIELDS
from reporting.models.report_product import ReportProduct
from model_bakery.baker import make_recipe, make


class ReportProductEmissionAllocationModelTest(BaseTestCase):
    @classmethod
    def setUpTestData(cls):
        facility_report = make_recipe("reporting.tests.utils.facility_report")
        product = make_recipe("registration.tests.utils.regulated_product")
        emission_category = EmissionCategory.objects.all().first()
        report_product = make(
            ReportProduct,
            report_version=facility_report.report_version,
            facility_report=facility_report,
            product=product,
        )
        cls.test_object = make(
            ReportProductEmissionAllocation,
            report_version=facility_report.report_version,
            facility_report=facility_report,
            report_product=report_product,
            emission_category=emission_category,
            allocated_quantity=Decimal('300.4151'),
            methodology='Other',
            other_methodology_description='Test description',
        )
        cls.field_data = [
            *TIMESTAMP_COMMON_FIELDS,
            ("id", "ID", None, None),
            ("report_version", "report version", None, None),
            ("facility_report", "facility report", None, None),
            ("report_product", "report product", None, None),
            ("emission_category", "emission category", None, None),
            ("allocated_quantity", "allocated quantity", None, None),
            ("methodology", "methodology", 255, None),
            ("other_methodology_description", "other methodology description", None, None),
        ]
