from common.tests.utils.helpers import BaseTestCase
from registration.tests.constants import TIMESTAMP_COMMON_FIELDS
from model_bakery.baker import make_recipe

from reporting.tests.utils.immutable_report_version import (
    assert_immutable_report_version,
)


class ReportElectricityImportDataTest(BaseTestCase):
    @classmethod
    def setUpTestData(cls):
        cls.test_object = make_recipe("reporting.tests.utils.electricity_import_data")
        cls.field_data = [
            ("id", "ID", None, None),
            *TIMESTAMP_COMMON_FIELDS,
            ("report_version", "report version", None, None),
            ("import_specified_electricity", "import specified electricity", None, None),
            ("import_specified_emissions", "import specified emissions", None, None),
            ("import_unspecified_electricity", "import unspecified electricity", None, None),
            ("import_unspecified_emissions", "import unspecified emissions", None, None),
            ("export_specified_electricity", "export specified electricity", None, None),
            ("export_specified_emissions", "export specified emissions", None, None),
            ("export_unspecified_electricity", "export unspecified electricity", None, None),
            ("export_unspecified_emissions", "export unspecified emissions", None, None),
            ("canadian_entitlement_electricity", "canadian entitlement electricity", None, None),
            ("canadian_entitlement_emissions", "canadian entitlement emissions", None, None),
        ]

    def test_immutable_after_report_version_submitted(self):
        assert_immutable_report_version("reporting.tests.utils.electricity_import_data")
