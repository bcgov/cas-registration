import json
from datetime import datetime
from registration.tests.utils.helpers import CommonTestSetup, TestUtils
from registration.models import FacilitySnapshot


class TestFacilitySnapshotsAPI(CommonTestSetup):
    def setup_method(self):
        super().setup_method()
        # create operator, operation, and facility and authorize user
        self.operator, self.operation, self.facility = TestUtils().create_operator_operation_and_facility(
            authorize_user=True
        )
        TestUtils.save_app_role(self, "industry_user")

        # build auth header
        self.auth_header = {'user_guid': str(self.user.user_guid)}
        self.auth_header_dumps = json.dumps(self.auth_header)

    def test_get_snapshots_by_operation(self):
        # create snapshot for the facility
        snapshot = FacilitySnapshot.objects.create(
            facility=self.facility,
            operation=self.operation,
            name="Snapshot Facility",
            type="Large Facility",
            snapshot_timestamp=datetime.utcnow(),
        )

        endpoint = f"/api/registration/facilities/snapshots?operation_id={self.operation.id}"
        response = TestUtils.client.get(endpoint, HTTP_AUTHORIZATION=self.auth_header_dumps)

        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert any(item["id"] == str(snapshot.id) for item in data)

    def test_get_snapshot_by_operation_and_facility(self):
        # create snapshot for the facility
        snapshot = FacilitySnapshot.objects.create(
            facility=self.facility,
            operation=self.operation,
            name="Snapshot Facility 2",
            type="Small Facility",
            snapshot_timestamp=datetime.utcnow(),
        )

        endpoint = (
            f"/api/registration/facilities/snapshots?operation_id={self.operation.id}&facility_id={self.facility.id}"
        )
        response = TestUtils.client.get(endpoint, HTTP_AUTHORIZATION=self.auth_header_dumps)

        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) == 1
        assert data[0]["id"] == str(snapshot.id)
