import pytest
from unittest.mock import patch, MagicMock
from service.data_access_service.opted_out_operation_detail_service import OptedOutOperationDataAccessService


# Disclosure: this file was largely written by ChatGPT.


@pytest.fixture
def opted_in_operation_detail_mock():
    """Fixture for a mocked OptedInOperationDetail instance."""
    mock_instance = MagicMock()
    mock_instance.id = 1
    mock_instance.save = MagicMock()
    return mock_instance


@pytest.fixture
def opted_out_operation_detail_mock():
    """Fixture for a mocked OptedOutOperationDetail instance."""
    mock_instance = MagicMock()
    mock_instance.id = 100
    mock_instance.save = MagicMock()
    return mock_instance


@pytest.fixture
def opted_out_operation_detail_data():
    """Fixture for input schema data."""
    mock_data = MagicMock()
    mock_data.effective_date = "Start of 2026"
    mock_data.dict.return_value = {
        "effective_date": "Start of 2026",
    }
    return mock_data


# ---------------------------------------------------------------------
# Tests for create_opted_out_operation_detail
# ---------------------------------------------------------------------


@patch("service.data_access_service.opted_out_operation_detail_service.OptedOutOperationDetail")
@patch("service.data_access_service.opted_out_operation_detail_service.OptedInOperationDetail")
def test_create_opted_out_operation_detail(
    mock_opted_in_model,
    mock_opted_out_model,
    opted_in_operation_detail_mock,
    opted_out_operation_detail_mock,
    opted_out_operation_detail_data,
):
    # Arrange
    mock_opted_in_model.objects.get.return_value = opted_in_operation_detail_mock
    mock_opted_out_model.objects.create.return_value = opted_out_operation_detail_mock

    # Act
    result = OptedOutOperationDataAccessService.create_opted_out_operation_detail(
        opted_in_operation_detail_id=1,
        opted_out_operation_detail_data=opted_out_operation_detail_data,
    )

    # Assert
    mock_opted_in_model.objects.get.assert_called_once_with(id=1)
    mock_opted_out_model.objects.create.assert_called_once_with(effective_date="Start of 2026")

    opted_in_operation_detail_mock.save.assert_called_once()
    assert result == opted_out_operation_detail_mock


# ---------------------------------------------------------------------
# Tests for update_opted_out_operation_detail
# ---------------------------------------------------------------------


@patch("service.data_access_service.opted_out_operation_detail_service.update_model_instance")
@patch("service.data_access_service.opted_out_operation_detail_service.OptedOutOperationDetail")
def test_update_opted_out_operation_detail(
    mock_opted_out_model,
    mock_update_model_instance,
    opted_out_operation_detail_mock,
    opted_out_operation_detail_data,
):
    # Arrange
    mock_opted_out_model.objects.get.return_value = opted_out_operation_detail_mock
    mock_update_model_instance.return_value = opted_out_operation_detail_mock

    # Act
    result = OptedOutOperationDataAccessService.update_opted_out_operation_detail(
        opted_out_operation_detail_id=100,
        opted_out_operation_detail_data=opted_out_operation_detail_data,
    )

    # Assert
    mock_opted_out_model.objects.get.assert_called_once_with(id=100)
    mock_update_model_instance.assert_called_once_with(
        opted_out_operation_detail_mock,
        opted_out_operation_detail_data.dict().keys(),
        opted_out_operation_detail_data.dict(),
    )
    opted_out_operation_detail_mock.save.assert_called_once()
    assert result == opted_out_operation_detail_mock
