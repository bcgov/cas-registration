from unittest.mock import patch, MagicMock
import uuid

import pytest
from django.contrib.contenttypes.models import ContentType

from service.elicensing_link_service import ELicensingLinkService
from compliance.models.elicensing_link import ELicensingLink
from registration.models.operator import Operator


@pytest.fixture
def mock_content_type():
    """Mock ContentType object for Operator model"""
    content_type = MagicMock(spec=ContentType)
    content_type.id = 1
    return content_type


@pytest.fixture
def mock_operator_id():
    """Generate a UUID for the test operator"""
    return uuid.uuid4()


@pytest.fixture
def mock_elicensing_link():
    """Mock an ELicensingLink object"""
    link = MagicMock(spec=ELicensingLink)
    link.id = uuid.uuid4()
    link.elicensing_object_id = "test-client-id"
    link.object_kind = ELicensingLink.ObjectKind.CLIENT
    link.content_type_id = 1
    link.object_id = uuid.uuid4()
    return link


class TestELicensingLinkService:
    """Tests for the ELicensingLinkService class"""

    @pytest.mark.django_db
    @patch('service.elicensing_link_service.ContentType.objects.get_for_model')
    @patch('service.elicensing_link_service.ELicensingLink.objects.get')
    def test_get_link_for_model_success(
        self, mock_get, mock_get_for_model, mock_operator_id, mock_content_type, mock_elicensing_link
    ):
        """Test getting an existing link for a model"""
        # Set up mocks
        mock_get_for_model.return_value = mock_content_type
        mock_get.return_value = mock_elicensing_link

        # Call the method
        result = ELicensingLinkService.get_link_for_model(Operator, mock_operator_id)

        # Verify results
        assert result == mock_elicensing_link

        # Verify the right methods were called with correct parameters
        mock_get_for_model.assert_called_once_with(Operator)
        mock_get.assert_called_once_with(
            content_type=mock_content_type, object_id=mock_operator_id, object_kind=ELicensingLink.ObjectKind.CLIENT
        )

    @pytest.mark.django_db
    @patch('service.elicensing_link_service.ContentType.objects.get_for_model')
    @patch('service.elicensing_link_service.ELicensingLink.objects.get')
    def test_get_link_for_model_not_found(self, mock_get, mock_get_for_model, mock_operator_id, mock_content_type):
        """Test getting a link that doesn't exist"""
        # Set up mocks
        mock_get_for_model.return_value = mock_content_type
        mock_get.side_effect = ELicensingLink.DoesNotExist()

        # Call the method
        result = ELicensingLinkService.get_link_for_model(Operator, mock_operator_id)

        # Verify results
        assert result is None

        # Verify the right methods were called with correct parameters
        mock_get_for_model.assert_called_once_with(Operator)
        mock_get.assert_called_once_with(
            content_type=mock_content_type, object_id=mock_operator_id, object_kind=ELicensingLink.ObjectKind.CLIENT
        )

    @pytest.mark.django_db
    @patch('service.elicensing_link_service.ContentType.objects.get_for_model')
    @patch('service.elicensing_link_service.ELicensingLink.objects.get')
    def test_get_link_for_model_with_custom_object_kind(
        self, mock_get, mock_get_for_model, mock_operator_id, mock_content_type, mock_elicensing_link
    ):
        """Test getting a link with a custom object kind"""
        # Set up mocks
        mock_get_for_model.return_value = mock_content_type
        mock_get.return_value = mock_elicensing_link
        custom_kind = "INVOICE"

        # Call the method
        result = ELicensingLinkService.get_link_for_model(Operator, mock_operator_id, object_kind=custom_kind)

        # Verify results
        assert result == mock_elicensing_link

        # Verify the right methods were called with correct parameters
        mock_get_for_model.assert_called_once_with(Operator)
        mock_get.assert_called_once_with(
            content_type=mock_content_type, object_id=mock_operator_id, object_kind=custom_kind
        )
