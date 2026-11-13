from common.tests.utils.helpers import BaseTestCase
from model_bakery.baker import make_recipe
from registration.tests.constants import (
    TIMESTAMP_COMMON_FIELDS,
)
from registration.models import FacilitySnapshot
from rls.tests.helpers import assert_policies_for_cas_roles, assert_policies_for_industry_user


class FacilitySnapshotModelTest(BaseTestCase):
    @classmethod
    def setUpTestData(cls):
        cls.test_object = make_recipe('registration.tests.utils.facility_snapshot')
        cls.field_data = [
            *TIMESTAMP_COMMON_FIELDS,
            ("id", "ID", None, None),
            ("operation", "operation", None, None),
            ("facility", "facility", None, None),
            ("name", "name", None, None),
            ("is_current_year", "is current year", None, None),
            ("starting_date", "starting date", None, None),
            ("type", "type", None, None),
            ("street_address", "street address", None, None),
            ("municipality", "municipality", None, None),
            ("province", "province", None, None),
            ("postal_code", "postal code", None, None),
            ("swrs_facility_id", "swrs facility id", None, None),
            ("bcghg_id", "bcghg id", None, None),
            ("latitude_of_largest_emissions", "latitude of largest emissions", None, None),
            ("longitude_of_largest_emissions", "longitude of largest emissions", None, None),
            ("well_authorization_numbers", "well authorization numbers", None, None),
            ("snapshot_timestamp", "snapshot timestamp", None, None),
        ]


class FacilitySnapshotRlsTest(BaseTestCase):

    def test_facility_snapshot_rls_industry_user(self):
        approved_user_operator = make_recipe('registration.tests.utils.approved_user_operator')
        approved_operation = make_recipe(
            'registration.tests.utils.operation', operator=approved_user_operator.operator, status='Draft'
        )
        make_recipe(
            'registration.tests.utils.operation_designated_operator_timeline',
            operator=approved_user_operator.operator,
            operation=approved_operation,
            start_date='2012-01-01',
            end_date='2099-12-31',
        )
        approved_facility = make_recipe('registration.tests.utils.facility', operation=approved_operation)
        approved_snapshot = make_recipe(
            'registration.tests.utils.facility_snapshot',
            operation=approved_operation,
            facility=approved_facility,
        )
        other_operator = make_recipe('registration.tests.utils.operator')
        other_operation = make_recipe('registration.tests.utils.operation', operator=other_operator)
        other_facility = make_recipe('registration.tests.utils.facility', operation=other_operation)
        other_snapshot = make_recipe(
            'registration.tests.utils.facility_snapshot',
            operation=other_operation,
            facility=other_facility,
        )
        previously_owned_operation = make_recipe('registration.tests.utils.operation', status='Draft')
        make_recipe(
            'registration.tests.utils.operation_designated_operator_timeline',
            operator=approved_user_operator.operator,
            operation=previously_owned_operation,
            start_date='2012-01-01',
            end_date='2015-12-31',
        )
        previously_owned_facility = make_recipe(
            'registration.tests.utils.facility', operation=previously_owned_operation
        )
        previously_owned_snapshot = make_recipe(
            'registration.tests.utils.facility_snapshot',
            operation=previously_owned_operation,
            facility=previously_owned_facility,
        )

        def select_function(cursor):
            FacilitySnapshot.objects.get(id=approved_snapshot.id)
            FacilitySnapshot.objects.get(id=previously_owned_snapshot.id)

        def forbidden_select_function(cursor):
            FacilitySnapshot.objects.get(id=other_snapshot.id)

        assert_policies_for_industry_user(
            FacilitySnapshot,
            approved_user_operator.user,
            select_function=select_function,
            forbidden_select_function=forbidden_select_function,
        )

    def test_facility_snapshot_rls_cas_user(self):
        operation = make_recipe('registration.tests.utils.operation')
        facility = make_recipe('registration.tests.utils.facility')
        test_quantity = 2
        make_recipe(
            "registration.tests.utils.facility_snapshot",
        )
        make_recipe(
            "registration.tests.utils.facility_snapshot",
        )

        def select_function(cursor):
            assert FacilitySnapshot.objects.count() == test_quantity

        def insert_function(cursor):
            FacilitySnapshot.objects.create(
                operation=operation, facility=facility, type='Large Facility', name="snapshot"
            )

        assert_policies_for_cas_roles(
            FacilitySnapshot,
            select_function=select_function,
            insert_function=insert_function,
        )
