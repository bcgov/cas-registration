from datetime import datetime
from itertools import cycle
from zoneinfo import ZoneInfo

from registration.models import OperationDesignatedOperatorTimeline
from registration.models.bc_obps_regulated_operation import BcObpsRegulatedOperation
from registration.models.bc_greenhouse_gas_id import BcGreenhouseGasId
from registration.models.facility_designated_operation_timeline import FacilityDesignatedOperationTimeline
from registration.models.document import Document
from registration.models.event.transfer_event import TransferEvent
from registration.models.facility import Facility
from registration.models.multiple_operator import MultipleOperator
from registration.models.app_role import AppRole
from registration.models.opted_in_operation_detail import OptedInOperationDetail
from registration.models.regulated_product import RegulatedProduct
from registration.models.user import User
from registration.models.user_operator import UserOperator
from registration.models.naics_code import NaicsCode
from registration.models.operation import Operation
from registration.models.business_role import BusinessRole
from registration.models.contact import Contact
from registration.models.partner_operator import PartnerOperator
from registration.models.parent_operator import ParentOperator
from registration.models.address import Address
from registration.models.business_structure import BusinessStructure
from registration.tests.utils.bakers import (
    generate_random_bc_corporate_registry_number,
    generate_random_cra_business_number,
)
from registration.models.operator import Operator
from model_bakery.recipe import Recipe, foreign_key, seq

naics_code = Recipe(NaicsCode, naics_code='486210')
address = Recipe(Address, street_address='Dreary Lane', municipality='Candyland', province='BC', postal_code='HOHOHO')
document = Recipe(Document, file='test.pdf')
bcghg_id = Recipe(BcGreenhouseGasId, id='23219990023')
boro_id = Recipe(BcObpsRegulatedOperation, id=seq("99-", start=1001))


operator = Recipe(
    Operator,
    legal_name=seq('Operator 0'),
    bc_corporate_registry_number=generate_random_bc_corporate_registry_number,
    business_structure=BusinessStructure.objects.first(),
    mailing_address=foreign_key(address),
    cra_business_number=generate_random_cra_business_number,
)

canadian_parent_operator = Recipe(
    ParentOperator,
    cra_business_number=generate_random_cra_business_number,
    mailing_address=foreign_key(address),
)

foreign_parent_operator = Recipe(
    ParentOperator,
)

partner_operator = Recipe(
    PartnerOperator,
    cra_business_number=generate_random_cra_business_number,
    bc_corporate_registry_number=generate_random_bc_corporate_registry_number,
    business_structure=BusinessStructure.objects.first(),
)

multiple_operator = Recipe(
    MultipleOperator,
    cra_business_number=generate_random_cra_business_number,
    bc_corporate_registry_number=generate_random_bc_corporate_registry_number,
    business_structure=BusinessStructure.objects.first(),
)


operator_for_operation = Recipe(
    Operator,
    bc_corporate_registry_number=generate_random_bc_corporate_registry_number,
    business_structure=BusinessStructure.objects.first(),
    mailing_address=foreign_key(address),
    cra_business_number=generate_random_cra_business_number,
)


industry_operator_user = Recipe(User, app_role=AppRole.objects.get(role_name="industry_user"))
cas_admin = Recipe(User, app_role=AppRole.objects.get(role_name="cas_admin"))
cas_analyst = Recipe(User, app_role=AppRole.objects.get(role_name="cas_analyst"))

operation = Recipe(
    Operation,
    name=seq('Operation 0'),
    naics_code=foreign_key(naics_code),
    operator=foreign_key(operator_for_operation),
    created_by=foreign_key(industry_operator_user),
    type='Single Facility Operation',
    registration_purpose=Operation.Purposes.OBPS_REGULATED_OPERATION,
)


operator_for_approved_user_operator = Recipe(
    Operator,
    bc_corporate_registry_number=generate_random_bc_corporate_registry_number,
    business_structure=BusinessStructure.objects.first(),
    mailing_address=foreign_key(address),
    cra_business_number=generate_random_cra_business_number,
)

user_operator = Recipe(
    UserOperator,
    operator=foreign_key(operator_for_approved_user_operator),
    user=foreign_key(industry_operator_user),
)

approved_user_operator = Recipe(
    UserOperator,
    status=UserOperator.Statuses.APPROVED,
    operator=foreign_key(operator_for_approved_user_operator),
    user=foreign_key(industry_operator_user),
)

opted_in_operation_detail = Recipe(
    OptedInOperationDetail,
    meets_section_3_emissions_requirements=True,
    meets_electricity_import_operation_criteria=True,
    meets_entire_operation_requirements=True,
    meets_section_6_emissions_requirements=True,
    meets_naics_code_11_22_562_classification_requirements=True,
    meets_producing_gger_schedule_a1_regulated_product=False,
    meets_reporting_and_regulated_obligations=False,
    meets_notification_to_director_on_criteria_change=False,
)
contact = Recipe(
    Contact,
    business_role=BusinessRole.objects.first(),
    address=foreign_key(address),
    first_name=seq('Firstname 0'),
    last_name=seq('Lastname 0'),
)


transfer_event = Recipe(
    TransferEvent,
    from_operator=foreign_key(operator),
    to_operator=foreign_key(operator),
)

facility = Recipe(Facility, address=foreign_key(address), name=seq('Facility 0'))

facility_designated_operation_timeline = Recipe(
    FacilityDesignatedOperationTimeline,
    operation=foreign_key(operation),
    facility=foreign_key(facility),
    status=cycle([status for status in FacilityDesignatedOperationTimeline.Statuses]),
    end_date=datetime.now(ZoneInfo("UTC")),
)

operation_designated_operator_timeline = Recipe(
    OperationDesignatedOperatorTimeline,
    operation=foreign_key(operation),
    operator=foreign_key(operator),
    start_date=datetime.now(ZoneInfo("UTC")),
    status=OperationDesignatedOperatorTimeline.Statuses.CLOSED,
    end_date=datetime.now(ZoneInfo("UTC")),
)

regulated_product = Recipe(RegulatedProduct)
