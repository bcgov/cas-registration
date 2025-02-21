from registration.models.bc_greenhouse_gas_id import BcGreenhouseGasId
from registration.models.naics_code import NaicsCode
from registration.enums.enums import OperationTypes
from common.tests.utils.helpers import BaseTestCase
from registration.models import Facility
from model_bakery import baker
from registration.tests.constants import (
    ADDRESS_FIXTURE,
    BC_OBPS_REGULATED_OPERATION_FIXTURE,
    BC_GREENHOUSE_GAS_ID_FIXTURE,
    CONTACT_FIXTURE,
    DOCUMENT_FIXTURE,
    FACILITY_FIXTURE,
    OPERATION_FIXTURE,
    OPERATOR_FIXTURE,
    TIMESTAMP_COMMON_FIELDS,
    USER_FIXTURE,
)


class FacilityModelTest(BaseTestCase):
    fixtures = [
        ADDRESS_FIXTURE,
        USER_FIXTURE,
        CONTACT_FIXTURE,
        OPERATOR_FIXTURE,
        OPERATION_FIXTURE,
        DOCUMENT_FIXTURE,
        BC_OBPS_REGULATED_OPERATION_FIXTURE,
        BC_GREENHOUSE_GAS_ID_FIXTURE,
        FACILITY_FIXTURE,
    ]

    @classmethod
    def setUpTestData(cls):
        cls.test_object = Facility.objects.first()
        cls.field_data = [
            *TIMESTAMP_COMMON_FIELDS,
            ("id", "ID", None, None),
            ("name", "name", 1000, None),
            ("type", "type", 100, None),
            ("address", "address", None, None),
            ("latitude_of_largest_emissions", "latitude of largest emissions", None, None),
            ("longitude_of_largest_emissions", "longitude of largest emissions", None, None),
            ("well_authorization_numbers", "well authorization numbers", None, None),
            ("swrs_facility_id", "swrs facility id", None, None),
            ("bcghg_id", "bcghg id", None, None),
            ("designated_operations", "facility designated operation timeline", None, None),
            ("operation", "operation", None, None),
            ("is_current_year", "is current year", None, None),
            ("starting_date", "starting date", None, None),
            ("facility_reports", "facility report", None, 0),
            ("transfer_events", "transfer event", None, None),
            ("restart_events", "restart event", None, None),
            ("closure_events", "closure event", None, None),
            ("temporary_shutdown_events", "temporary shutdown event", None, None),
        ]

    # More general BCGHG ID generation tests are in test_utils
    def test_generate_unique_bcghg_id_multiple_existing_ids_facility(self):
        existing_ids = ['13221210001', '13221210002', '13221210003', '23221210001', '23221210002', '14862100001']
        for existing_id in existing_ids:
            baker.make_recipe(
                'registration.tests.utils.operation', bcghg_id=baker.make(BcGreenhouseGasId, id=existing_id)
            )
        facility_designated_operation_timeline = baker.make_recipe(
            'registration.tests.utils.facility_designated_operation_timeline', facility=self.test_object, end_date=None
        )
        facility_designated_operation_timeline.operation.type = OperationTypes.SFO.value
        facility_designated_operation_timeline.operation.naics_code = baker.make(NaicsCode, naics_code='322121')
        facility_designated_operation_timeline.operation.save()

        self.test_object.bcghg_id = None
        cas_director = baker.make_recipe('registration.tests.utils.cas_director')
        self.test_object.generate_unique_bcghg_id(user_guid=cas_director.user_guid)
        expected_id = '13221210004'
        assert self.test_object.bcghg_id.pk == expected_id
