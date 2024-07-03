from registration.models.facility_ownership_timeline import FacilityOwnershipTimeline
from registration.models.operation import Operation
from model_bakery import baker
from localflavor.ca.models import CAPostalCodeField
from registration.models import (
    UserOperator,
)
from registration.tests.utils.helpers import CommonTestSetup, TestUtils

from registration.tests.utils.bakers import facility_baker, operation_baker, operator_baker, user_operator_baker
from registration.utils import custom_reverse_lazy

baker.generators.add(CAPostalCodeField, TestUtils.mock_postal_code)


class TestFacilityIdEndpoint(CommonTestSetup):
    endpoint = CommonTestSetup.base_endpoint + "facilities"

    def test_facilities_endpoint_unauthorized_roles_cannot_get(self):
        facility = facility_baker()
        # cas_pending can't get
        response = TestUtils.mock_get_with_auth_role(
            self, "cas_pending", custom_reverse_lazy("get_facility", kwargs={"facility_id": facility.id})
        )
        assert response.status_code == 401

        # unapproved industry users can't get
        user_operator_instance = user_operator_baker(
            {
                'status': UserOperator.Statuses.PENDING,
            }
        )
        user_operator_instance.user_id = self.user.user_guid
        user_operator_instance.save()

        response = TestUtils.mock_get_with_auth_role(
            self,
            "industry_user",
            custom_reverse_lazy("get_facility", kwargs={"facility_id": facility.id}),
        )
        assert response.status_code == 401

    def test_get_facility_with_invalid_facility_id(self):
        response = TestUtils.mock_get_with_auth_role(
            self, endpoint=custom_reverse_lazy("get_facility", kwargs={"facility_id": '99999'}), role_name="cas_admin"
        )
        assert response.status_code == 422
        assert (
            response.json().get('detail')[0].get('msg')
            == 'Input should be a valid UUID, invalid length: expected length 32 for simple format, found 5'
        )

    def test_industry_users_can_get_their_own_facilities(self):

        operator = operator_baker()
        TestUtils.authorize_current_user_as_operator_user(self, operator)
        owning_operation: Operation = operation_baker(operator.id)
        facility = facility_baker()

        baker.make(FacilityOwnershipTimeline, operation=owning_operation, facility=facility)
        response = TestUtils.mock_get_with_auth_role(
            self,
            endpoint=custom_reverse_lazy("get_facility", kwargs={"facility_id": facility.id}),
            role_name="industry_user",
        )
        assert response.status_code == 200
        response.json().get('name') is not None

    def test_industry_users_cannot_get_other_users_facilities(self):
        facility = facility_baker()
        baker.make(FacilityOwnershipTimeline, operation=operation_baker(), facility=facility)

        response = TestUtils.mock_get_with_auth_role(
            self,
            endpoint=custom_reverse_lazy("get_facility", kwargs={"facility_id": facility.id}),
            role_name="industry_user",
        )
        assert response.status_code == 401
        assert response.json()['detail'] == 'Unauthorized.'
