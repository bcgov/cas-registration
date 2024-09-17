from typing import List, Optional
from uuid import UUID
from ninja import ModelSchema, Schema, Field
from pydantic import field_validator


from registration.constants import BC_CORPORATE_REGISTRY_REGEX
from registration.models import BusinessStructure
from registration.schema.v1.business_structure import validate_business_structure
from registration.schema.validators import validate_cra_business_number

from registration.schema.v2.partner_operator import PartnerOperatorIn
from registration.schema.v2.parent_operator import ParentOperatorIn

class UserOperatorOperatorOut(Schema):
    """
    Schema for the User operator operator form
    """
    operator_id: UUID    
    user_operator_id: UUID