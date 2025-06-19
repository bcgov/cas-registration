import logging
import uuid
from compliance.service.elicensing.elicensing_api_client import ClientCreationRequest, ELicensingAPIClient
from django.db import transaction
from registration.models.operator import Operator
from compliance.models.elicensing_client_operator import ElicensingClientOperator
from django.core.exceptions import MultipleObjectsReturned

logger = logging.getLogger(__name__)

elicensing_api_client = ELicensingAPIClient()


class ElicensingOperatorService:
    """
    Service for managing operator-related eLicensing operations.
    This service handles the mapping between operators and eLicensing clients,
    creating clients in eLicensing, and syncing data between systems.
    """

    @classmethod
    def _map_operator_to_client_data(cls, operator: Operator) -> ClientCreationRequest:
        """
        Map operator data to eLicensing client data format.

        Args:
            operator: The operator object

        Returns:
            A ClientCreationRequest object with data mapped from the operator
        """

        client_data = {
            "clientGUID": str(uuid.uuid4()),
            "companyName": operator.legal_name,
            "doingBusinessAs": operator.trade_name if operator.trade_name else "",
            "bcCompanyRegistrationNumber": operator.bc_corporate_registry_number or "",
            "businessAreaCode": "OBPS",
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

        return ClientCreationRequest(**client_data)

    @classmethod
    @transaction.atomic
    def sync_client_with_elicensing(cls, operator_id: uuid.UUID) -> ElicensingClientOperator:
        """
        Syncs an operator with eLicensing by creating a client.
        If a client already exists, returns the existing record.

        Args:
            operator_id: The ID of the operator to sync

        Returns:
            The ElicensingClientOperator record for the client

        Raises:
            Operator.DoesNotExist: If the operator doesn't exist
            requests.RequestException: If the API request fails
            MultipleObjectsReturned: If there are multiple records found to exist in the ElicensingClientOperator table
            Exception: For any other unexpected errors
        """
        operator = Operator.objects.get(id=operator_id)

        # Check if a client already exists for this operator
        # existing_record = ElicensingClientOperator.managed_objects.get_one_or_none(operator_id=operator_id)
        try:
            existing_record = ElicensingClientOperator.objects.get(operator_id=operator_id)
        except (ElicensingClientOperator.DoesNotExist):
            existing_record = None
        except (MultipleObjectsReturned):
            raise MultipleObjectsReturned

        if existing_record and existing_record.client_object_id is not None:
            logger.info(
                f"Operator {operator_id} already has eLicensing client with ID {existing_record.client_object_id}"
            )
            return existing_record

        client_data = cls._map_operator_to_client_data(operator)

        response = elicensing_api_client.create_client(client_data)

        # Create link with the client ID and GUID from the client data
        client_record = ElicensingClientOperator.objects.create(
            client_object_id=response.clientObjectId,
            client_guid=uuid.UUID(client_data.clientGUID),
            operator=operator,
        )

        logger.info(f"Successfully synced operator {operator_id} with eLicensing as client {response.clientObjectId}")
        return client_record
