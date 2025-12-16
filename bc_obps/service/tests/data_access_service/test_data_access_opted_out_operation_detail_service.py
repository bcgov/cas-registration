import pytest
from unittest.mock import patch

from registration.schema import OptedOutOperationDetailIn
from registration.models.opted_in_operation_detail import OptedInOperationDetail
from registration.models.opted_out_operation_detail import OptedOutOperationDetail
from service.data_access_service.opted_out_operation_detail_service import OptedOutOperationDataAccessService
from model_bakery import baker


pytestmark = pytest.mark.django_db

# Disclosure: this file was largely written by ChatGPT.


@pytest.fixture
def opted_in_operation_detail():
    return baker.make(OptedInOperationDetail)


@pytest.fixture
def opted_out_schema():
    return OptedOutOperationDetailIn(
        final_reporting_year=2025,
    )


class TestUpsertOptedOutOperationDetail:
    def test_creates_opted_out_operation_when_none_exists(
        self,
        opted_in_operation_detail,
        opted_out_schema,
    ):
        # precondition
        assert opted_in_operation_detail.opted_out_operation is None

        result = OptedOutOperationDataAccessService.upsert_opted_out_operation_detail(
            opted_in_operation_detail_id=opted_in_operation_detail.id,
            opted_out_operation_detail_data=opted_out_schema,
        )

        opted_in_operation_detail.refresh_from_db()

        assert isinstance(result, OptedOutOperationDetail)
        assert result.final_reporting_year_id == opted_out_schema.final_reporting_year
        assert opted_in_operation_detail.opted_out_operation == result

    @patch("service.data_access_service.opted_out_operation_detail_service.update_model_instance")
    def test_updates_existing_opted_out_operation(
        self,
        mock_update_model_instance,
        opted_in_operation_detail,
        opted_out_schema,
    ):
        existing_opted_out = OptedOutOperationDetail.objects.create(
            final_reporting_year_id=2024,
        )
        opted_in_operation_detail.opted_out_operation = existing_opted_out
        opted_in_operation_detail.save()

        # mock update_model_instance to return the same instance
        mock_update_model_instance.return_value = existing_opted_out

        result = OptedOutOperationDataAccessService.upsert_opted_out_operation_detail(
            opted_in_operation_detail_id=opted_in_operation_detail.id,
            opted_out_operation_detail_data=opted_out_schema,
        )

        mock_update_model_instance.assert_called_once_with(
            existing_opted_out,
            opted_out_schema.dict().keys(),
            opted_out_schema.dict(),
        )

        assert result == existing_opted_out


class TestDeleteOptedOutOperationDetail:
    def test_deletes_opted_out_operation_and_detaches_from_opted_in(self):
        opted_out = OptedOutOperationDetail.objects.create(
            final_reporting_year_id=2025,
        )
        opted_in = OptedInOperationDetail.objects.create(
            opted_out_operation=opted_out,
        )

        OptedOutOperationDataAccessService.delete_opted_out_operation_detail(opted_out_operation_detail_id=opted_out.id)

        opted_in.refresh_from_db()

        assert opted_in.opted_out_operation is None
        assert not OptedOutOperationDetail.objects.filter(id=opted_out.id).exists()

    def test_delete_is_idempotent_when_record_does_not_exist(self):
        # should not raise
        OptedOutOperationDataAccessService.delete_opted_out_operation_detail(opted_out_operation_detail_id=999999)
