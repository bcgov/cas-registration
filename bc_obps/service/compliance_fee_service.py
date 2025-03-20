import logging
import uuid
from datetime import date
from decimal import Decimal
from typing import Dict, Any, Optional
from django.db import transaction

from compliance.models import ComplianceFee, ComplianceObligation
import requests

logger = logging.getLogger(__name__)


class ComplianceFeeService:
    """
    Service for managing compliance fees
    """

    @classmethod
    @transaction.atomic
    def create_compliance_fee(cls, compliance_obligation_id: int) -> Optional[ComplianceFee]:
        """
        Creates a compliance fee for the given compliance obligation.
        
        The fee amount is calculated based on the emissions_amount_tco2e field
        of the compliance obligation, multiplied by the fee rate ($25.00 per tCO2e).
        
        Args:
            compliance_obligation_id: The ID of the compliance obligation
            
        Returns:
            The created ComplianceFee object if successful, None if there was an error
            
        Raises:
            ComplianceObligation.DoesNotExist: If the compliance obligation doesn't exist
        """
        try:
            obligation = ComplianceObligation.objects.get(id=compliance_obligation_id)
            
            # Calculate fee amount: emissions_amount_tco2e * $25.00
            fee_amount = obligation.emissions_amount_tco2e * ComplianceFee.EXCESS_EMISSIONS_FEE_RATE
            
            # Generate a descriptive fee description
            reporting_year = obligation.compliance_summary.report.reporting_period.year
            fee_description = f"Excess Emissions Fee {reporting_year}"
            
            # Create the fee record
            fee = ComplianceFee.objects.create(
                compliance_obligation=obligation,
                fee_amount=fee_amount,
                status=ComplianceFee.FeeStatus.PENDING,
                fee_date=date.today(),
                fee_description=fee_description,
                fee_profile_group_name="EXCESS_EMISSIONS",
                business_area_code="OBPS"
            )
            
            return fee
            
        except ComplianceObligation.DoesNotExist:
            logger.error(f"Compliance obligation with ID {compliance_obligation_id} does not exist")
            return None
        except Exception as e:
            logger.error(f"Error creating compliance fee for obligation {compliance_obligation_id}: {str(e)}")
            raise
    
    @classmethod
    @transaction.atomic
    def update_fee_status(cls, fee_id: int, status: str) -> Optional[ComplianceFee]:
        """
        Updates the status of a compliance fee
        
        Args:
            fee_id: The ID of the compliance fee
            status: The new status (use ComplianceFee.FeeStatus choices)
            
        Returns:
            The updated ComplianceFee object if successful, None if there was an error
            
        Raises:
            ComplianceFee.DoesNotExist: If the fee doesn't exist
        """
        try:
            fee = ComplianceFee.objects.get(id=fee_id)
            fee.status = status
            fee.save()
            return fee
        except ComplianceFee.DoesNotExist:
            logger.error(f"Compliance fee with ID {fee_id} does not exist")
            return None
        except Exception as e:
            logger.error(f"Error updating status for compliance fee {fee_id}: {str(e)}")
            raise 