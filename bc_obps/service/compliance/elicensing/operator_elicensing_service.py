import logging
import uuid
from typing import Dict, Any, Optional
from django.db import transaction
from django.contrib.contenttypes.models import ContentType
from django.utils import timezone
from service.compliance.elicensing.elicensing_api_client import ELicensingAPIClient
from service.compliance.elicensing.elicensing_link_service import ELicensingLinkService
from registration.models.operator import Operator
from compliance.models.elicensing_link import ELicensingLink
import requests

logger = logging.getLogger(__name__)

elicensing_api_client = ELicensingAPIClient()


class OperatorELicensingService:
    """
    Service for managing operator-related eLicensing operations.
    This service handles the mapping between operators and eLicensing clients,
    creating clients in eLicensing, and syncing data between systems.
    """

    @classmethod
    def _map_operator_to_client_data(cls, operator: Operator) -> Dict[str, Any]:
        """
        Map operator data to eLicensing client data format.

        Args:
            operator: The operator object

        Returns:
            A dictionary with client data in the format expected by the eLicensing API
        """
        client_guid = str(uuid.uuid4())

        client_data = {
            "clientGUID": client_guid,
            "companyName": operator.legal_name,
            "doingBusinessAs": operator.trade_name if operator.trade_name else "",
            "bcCompanyRegistrationNumber": operator.bc_corporate_registry_number or "",
            # Add default dateOfBirth as operators are companies, not individuals
            "dateOfBirth": "1970-01-01",
        }

        # Add address information if available
        if operator.physical_address:
            address = operator.physical_address
            client_data.update(
                {
                    "addressLine1": address.street_address or "",
                    "addressLine2": "",  # The Address model doesn't have additional_information field
                    "city": address.municipality or "",  # Using municipality instead of city
                    "stateProvince": address.province or "",
                    "postalCode": address.postal_code or "",
                    "country": "Canada",  # Default to Canada as Address model doesn't have country
                }
            )
        elif operator.mailing_address:
            # Fall back to mailing address if physical address is not available
            address = operator.mailing_address
            client_data.update(
                {
                    "addressLine1": address.street_address or "",
                    "addressLine2": "",  # The Address model doesn't have additional_information field
                    "city": address.municipality or "",  # Using municipality instead of city
                    "stateProvince": address.province or "",
                    "postalCode": address.postal_code or "",
                    "country": "Canada",  # Default to Canada as Address model doesn't have country
                }
            )
        else:
            # If no address is available, use placeholder values
            # These will need to be updated later
            client_data.update(
                {
                    "addressLine1": "Unknown",
                    "city": "Unknown",
                    "stateProvince": "BC",
                    "postalCode": "V0V0V0",
                    "country": "Canada",
                }
            )

        # Add at least one phone number (required by API)
        # Since we don't have direct phone number fields in the Operator model,
        # we'll use a placeholder value
        client_data["businessPhone"] = "0000000000"  # Placeholder

        return client_data

    @classmethod
    @transaction.atomic
    def sync_client_with_elicensing(cls, operator_id: uuid.UUID) -> Optional[ELicensingLink]:
        """
        Syncs an operator with the eLicensing system by creating a client record.
        If a client already exists, returns the existing link.

        Args:
            operator_id: The UUID of the operator to sync

        Returns:
            The ELicensingLink object if successful, None if there was an error

        Raises:
            Operator.DoesNotExist: If the operator doesn't exist
        """
        try:
            operator = Operator.objects.get(id=operator_id)

            # Check if a client already exists for this operator
            existing_link = ELicensingLinkService.get_link_for_model(
                Operator, operator_id, elicensing_object_kind=ELicensingLink.ObjectKind.CLIENT
            )

            if existing_link and existing_link.elicensing_object_id is not None:
                logger.info(
                    f"Operator {operator_id} already has eLicensing client with ID {existing_link.elicensing_object_id}"
                )
                return existing_link

            # Map operator data to eLicensing format
            client_data = cls._map_operator_to_client_data(operator)

            # Make the API call
            try:
                response = elicensing_api_client.create_client(client_data)

                # Create link with the client ID and GUID from the client data
                client_link = ELicensingLinkService.create_link(
                    operator,
                    response['clientObjectId'],
                    ELicensingLink.ObjectKind.CLIENT,
                    elicensing_guid=client_data['clientGUID'],
                )

                logger.info(
                    f"Successfully synced operator {operator_id} with eLicensing as client {response['clientObjectId']}"
                )
                return client_link

            except requests.RequestException as e:
                logger.error(f"eLicensing API request failed for operator {operator_id}: {str(e)}")
                return None

        except Operator.DoesNotExist:
            logger.error(f"Operator with ID {operator_id} does not exist")
            return None
        except Exception as e:
            logger.error(f"Error syncing operator {operator_id} with eLicensing: {str(e)}")
            return None
