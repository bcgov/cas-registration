from typing import Dict
from django.utils import timezone
from registration.tests.utils.helpers import CommonTestSetup, TestUtils
from registration.tests.utils.bakers import operator_baker
from registration.models import FacilitySnapshot
from model_bakery import baker


class TestFacilitySnapshotsAPI(CommonTestSetup):
    def setup_method(self):
        super().setup_method()

    def test_get_snapshots_by_operation_and_facility(self):
        # Create operator, operation, and facility
        operator, operation, facility = TestUtils.create_operator_operation_and_facility(self, authorize_user=True)

        # Create multiple snapshots for the same facility and operation
        snapshot1 = baker.make(
            FacilitySnapshot,
            facility=facility,
            operation=operation,
            name="Snapshot Facility 1",
            type="Small Facility",
            snapshot_timestamp=timezone.now(),
        )
        snapshot2 = baker.make(
            FacilitySnapshot,
            facility=facility,
            operation=operation,
            name="Snapshot Facility 2",
            type="Medium Facility",
            snapshot_timestamp=timezone.now(),
        )

        endpoint = f"/api/registration/facilities/snapshots?operation_id={operation.id}&facility_id={facility.id}"
        response = TestUtils.mock_get_with_auth_role(
            self,
            endpoint=endpoint,
            role_name="industry_user",
        )

        assert response.status_code == 200
        response_json: Dict = response.json()
        assert isinstance(response_json, list)
        assert len(response_json) == 2
        snapshot_ids = [item["id"] for item in response_json]
        assert str(snapshot1.id) in snapshot_ids
        assert str(snapshot2.id) in snapshot_ids
        assert response_json[0]["name"] in ["Snapshot Facility 1", "Snapshot Facility 2"]
        assert response_json[0]["type"] in ["Small Facility", "Medium Facility"]

    def test_get_snapshots_with_missing_facility_id(self):
        # Create operator, operation, and facility
        operator, operation, facility = TestUtils.create_operator_operation_and_facility(self, authorize_user=True)

        # Try to call endpoint without facility_id - should fail validation
        endpoint = f"/api/registration/facilities/snapshots?operation_id={operation.id}"
        response = TestUtils.mock_get_with_auth_role(
            self,
            endpoint=endpoint,
            role_name="industry_user",
        )

        # Should return 422 (validation error) since facility_id is required
        assert response.status_code == 422

    def test_get_snapshots_with_missing_operation_id(self):
        # Create operator, operation, and facility
        operator, operation, facility = TestUtils.create_operator_operation_and_facility(self, authorize_user=True)

        # Try to call endpoint without operation_id - should fail validation
        endpoint = f"/api/registration/facilities/snapshots?facility_id={facility.id}"
        response = TestUtils.mock_get_with_auth_role(
            self,
            endpoint=endpoint,
            role_name="industry_user",
        )

        # Should return 422 (validation error) since operation_id is required
        assert response.status_code == 422

    def test_get_snapshots_not_associated_with_their_operator(self):
        # Create an operator and operation not associated with the current user
        other_operator, other_operation, other_facility = TestUtils.create_operator_operation_and_facility(self)

        # Create a snapshot for this other facility
        snapshot = baker.make(
            FacilitySnapshot,
            facility=other_facility,
            operation=other_operation,
            name="Other Snapshot",
            type="Medium Facility",
            snapshot_timestamp=timezone.now(),
        )

        # Create a different operator for the current user
        user_operator = operator_baker()
        TestUtils.authorize_current_user_as_operator_user(self, user_operator)

        endpoint = (
            f"/api/registration/facilities/snapshots?operation_id={other_operation.id}&facility_id={other_facility.id}"
        )
        response = TestUtils.mock_get_with_auth_role(
            self,
            endpoint=endpoint,
            role_name="industry_user",
        )

        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) == 1
        assert data[0]["id"] == str(snapshot.id)

    def test_get_snapshots_returns_empty_when_no_snapshots_exist(self):
        # Create operator, operation, and facility without snapshots
        operator, operation, facility = TestUtils.create_operator_operation_and_facility(self, authorize_user=True)

        endpoint = f"/api/registration/facilities/snapshots?operation_id={operation.id}&facility_id={facility.id}"
        response = TestUtils.mock_get_with_auth_role(
            self,
            endpoint=endpoint,
            role_name="industry_user",
        )

        assert response.status_code == 200
        response_json = response.json()
        assert isinstance(response_json, list)
        assert len(response_json) == 0
