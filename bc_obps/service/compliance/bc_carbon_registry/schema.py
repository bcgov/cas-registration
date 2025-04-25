from datetime import datetime, date
from pydantic import BaseModel, Field, PositiveInt, AnyUrl, PositiveFloat, model_validator
from typing import List, Dict, Any, Optional, Annotated, Union

########## REUSABLE TYPES ##########
DigitString = Annotated[str, Field(pattern=r'^\d+$')]
FifteenDigitPositiveInt = Annotated[PositiveInt, Field(pattern=r'^\d{15}$')]
FifteenDigitString = Annotated[str, Field(pattern=r'^\d{15}$')]


class Pagination(BaseModel):
    start: Optional[PositiveInt] = 0
    limit: Optional[PositiveInt] = 20
    sortOptions: Optional[List[Dict[str, str]]] = [{"sort": "accountName.keyword", "dir": "ASC"}]


class ColumnFilter(BaseModel):
    filterType: str
    type: str
    filter: str


class FilterModel(BaseModel):
    entityId: Optional[Dict[FifteenDigitPositiveInt, List[ColumnFilter]]] = None
    accountTypeId: Optional[Dict[PositiveInt, List[ColumnFilter]]] = None
    masterAccountId: Optional[Dict[PositiveInt, List[ColumnFilter]]] = None
    accountId: Optional[Dict[FifteenDigitPositiveInt, List[ColumnFilter]]] = None


class SearchFilter(BaseModel):
    pagination: Pagination
    filterModel: Union[FilterModel, dict] = {}
    groupKeys: Optional[List[str]] = []


class TokenResponse(BaseModel):
    access_token: str
    expires_in: PositiveInt
    token_type: str


class PaginatedResponse(BaseModel):
    totalEntities: PositiveInt
    totalPages: PositiveInt
    start: Optional[PositiveInt] = None
    limit: Optional[PositiveInt] = None
    numberOfElements: PositiveInt
    first: bool
    last: bool

    class Config:
        extra = "allow"  # Allow extra fields for API flexibility


class GenericResponse(BaseModel):
    success: bool
    result: Dict[str, Any]

    class Config:
        extra = "allow"  # Allow extra fields for API flexibility


########## Transfers ##########
class TransferMixedUnit(BaseModel):
    account_id: PositiveInt  # 202 // Holding account ID
    serial_no: str  # "BC-BCE-IN-104000000037027-01032025-30032025-16414-16752-SPG"
    new_quantity: PositiveInt  # 1
    id: FifteenDigitString  # "103200000396923"
    do_action: Optional[bool] = True  # Always true


class TransferPayload(BaseModel):
    destination_account_id: FifteenDigitString  # "103000000036531"
    mixedUnitList: List[TransferMixedUnit]

    class Config:
        extra = "forbid"
        str_strip_whitespace = True  # Strip whitespace from strings


########## Accounts ##########
class AccountDetailEntity(BaseModel):
    id: str  # "103100000028577_140000000000001" (accountId + "_" + standardId)
    entityId: PositiveInt  # 103100000028577
    esUpdatedOn: datetime  # "2025-04-16T20:21:48.530988557"
    standardId: PositiveInt  # 140000000000001
    standardName: str  # "BC Carbon Registry"
    accountId: PositiveInt  # 103100000028577
    accountName: str  # "General Participant Admin Test"
    modifiedDate: datetime  # "2025-04-16T20:21:48.26"
    mainContactName: str  # "Kelly Konrad"
    accountTypeName: str  # "General Participant"
    accountTypeId: PositiveInt  # 10
    organizationClassificationId: FifteenDigitString  # "100000000000097"
    organizationClassification: str  # "Broker/Trader/Retailer"
    countryName: str  # "Canada"
    countryId: FifteenDigitString  # "100000000000003"
    stateName: str  # "Active"
    stateCode: str  # "ACTIVE"
    website: AnyUrl  # "www.generaladminparticipant.com"
    publicVisibility: bool  # true
    hasChildren: bool  # false
    activatedDate: datetime  # "2025-04-16T20:21:46"
    submittedDate: datetime  # "2025-04-16T17:53:14"
    accountManagerEmail: str  # "manager.email@gov.bc.ca"
    type_of_account_holder: str  # "Corporation"
    masterAccountId: Optional[PositiveInt]  # 102000000001000
    masterAccountName: Optional[str]  # "British Columbia Government Account"
    billingContactEmail: Optional[str]  # "someone.email@gov.bc.ca"
    auxiliaries: Optional[Any]  # None

    class Config:
        extra = "allow"


class AccountDetailsResponse(PaginatedResponse):
    entities: List[AccountDetailEntity]

    class Config:
        extra = "allow"


########## Units ##########
class UnitEntity(BaseModel):
    id: FifteenDigitString  # "103200000391892"
    entityId: PositiveInt  # 103200000391892
    esUpdatedOn: datetime  # "2025-04-12T00: #55: #40.446122835"
    standardId: PositiveInt  # 140000000000001
    standardName: str  # "BC Carbon Registry"
    accountId: PositiveInt  # 103100000028565
    accountName: str  # "BC Beta Checkout 2 11042025"
    modifiedDate: datetime  # "2025-04-11T18: #11: #13.66"
    auxiliaries: Optional[Any]  # None
    projectId: PositiveInt  # 104100000030211
    countryName: str  # "Cambodia"
    countryId: FifteenDigitString  # "100000000000123"
    projectTypeName: str  # "Emissions Reduction"
    stateName: str  # "Retired"
    stateCode: str  # "RETIRED"
    projectName: str  # "BC Project Beta Chekcout 1 11042025"
    vintage: DigitString  # "2025"
    holdingQuantity: PositiveFloat  # 2.0
    publicVisibility: bool  # true
    doAssign: bool  # false
    doRetire: bool  # false
    doExchangeListing: bool  # false
    doGenericCancel: bool  # false
    unitMeasurementName: str  # "tCO2e"
    serialNo: str  # "BC-BCO-KH-104100000030211-11042025-12042025-1-2-SPG"
    className: str  # "BCO"
    isBuffer: bool  # false
    doRfi: bool  # false
    doNotDeliver: bool  # false
    unitType: str  # "BCO"
    accountTypeCode: str  # "PROJECT_PROPONENT"

    class Config:
        extra = "allow"


class UnitDetailsResponse(PaginatedResponse):
    entities: List[UnitEntity]

    class Config:
        extra = "allow"


########## Projects ##########
class ProjectPayloadMixedUnit(BaseModel):
    city: str  # "City"
    address_line_1: str  # "Line 1"
    zipcode: str  # "H0H0H0"
    province: str  # "BC"
    period_start_date: date  # "2025-01-01"
    period_end_date: date  # "2025-01-31"
    # Optional fields (Default based on the S&P API documentation)
    country_id: Optional[FifteenDigitPositiveInt] = 100000000000003  # Canada
    environmental_category_id: Optional[FifteenDigitString] = "100000000000001"  # Carbon
    project_type_id: Optional[FifteenDigitString] = "140000000000002"  # OBPS
    standard_id: Optional[FifteenDigitString] = "140000000000001"  # BC
    newRecord: Optional[bool] = True

    @model_validator(mode='before')
    @classmethod
    def end_date_after_start_date(cls, data: 'ProjectPayloadMixedUnit') -> 'ProjectPayloadMixedUnit':
        if data.period_end_date < data.period_start_date:
            raise ValueError('period_end_date must be on or after period_start_date')
        return data


class ProjectPayload(BaseModel):
    account_id: FifteenDigitString  # "103100000028575"
    project_name: str  # "Test BC Project"
    project_description: str  # "Test BC Project Description"
    mixedUnitList: List[ProjectPayloadMixedUnit]
    # Optional fields (Default based on the S&P API documentation)
    newRecord: Optional[bool] = True
    saveAsDraft: Optional[bool] = False
    project_public_visibility: Optional[bool] = True

    class Config:
        extra = "forbid"  # Forbid extra fields not defined in the model
        str_strip_whitespace = True  # Strip whitespace from strings


class ProjectDetailsResponse(BaseModel):
    id: FifteenDigitPositiveInt  # 103000000392508
    account_id: FifteenDigitString  # "103100000028575"
    project_name: str  # "Test BC Project 3 - Billie Blue"
    project_description: str  # "Test BC Project Description"
    # Response has a lot of other fields, but for now we are only interested in these

    class Config:
        extra = "allow"


######## Issuance ##########
class IssuancePayloadMixedUnit(BaseModel):
    holding_quantity: PositiveInt  # 100
    state_name: str  # "NEW"
    vintage_start: datetime  # "2025-01-01T00:00:00Z"
    vintage_end: datetime  # "2025-01-31T00:00:00Z"
    city: str  # "City"
    address_line_1: str  # "Line 1"
    zipcode: str  # "H0H0H0"
    province: str  # "BC"
    defined_unit_id: FifteenDigitPositiveInt  # 103000000392535 //project->mixedUnitList[0].id
    # Optional fields (Default based on the S&P API documentation)
    public_visibility: Optional[bool] = False
    standard_id: Optional[FifteenDigitString] = "140000000000001"  # BC
    country_id: Optional[FifteenDigitPositiveInt] = 100000000000003  # Canada
    project_type_id: Optional[FifteenDigitPositiveInt] = 100000000000117  # OBPS


class IssuancePayloadVerification(BaseModel):
    verificationStartDate: date  # "2025-01-01"
    verificationEndDate: date  # "2025-01-31"
    monitoringPeriod: str  # "01/01/2025 - 31/01/2025"
    verifierId: PositiveInt  # 204
    mixedUnits: List[IssuancePayloadMixedUnit]


class IssuancePayload(BaseModel):
    account_id: FifteenDigitString  # "103100000028575"
    issuance_requested_date: datetime  # "2025-01-24T13:13:28.547Z"
    project_id: FifteenDigitPositiveInt  # 104000000036500
    unit_type_id: FifteenDigitPositiveInt  # 140000000000001 # BCE
    verifications: List[IssuancePayloadVerification]

    class Config:
        extra = "forbid"
        str_strip_whitespace = True  # Strip whitespace from strings


####### SubAccount ########
class SubAccountPayload(BaseModel):
    organization_classification_id: FifteenDigitPositiveInt  # 100000000000097 // organizationClassificationId from master account
    compliance_year: PositiveInt  # 2025
    registered_name: str  # "Test BC Subaccount 31 Mar 2"
    master_account_id: FifteenDigitPositiveInt  # 103000000037199
    type_of_organization: FifteenDigitString  # "140000000000001" // Account Holder
    trading_name: str  # "Test BC Subaccount 31 Mar 1"
    registration_number_assigend_by_registrar: str  # "dwd" // Registration Number Assigned by the BC Registrar of Companies
    boro_id: str = Field(pattern=r"^\d{2}-\d{4}$")
    # Optional fields (Default based on the S&P API documentation)
    account_type_id: Optional[PositiveInt] = 14  # Compliance
    indicatedStandardList: Optional[List[Dict[str, PositiveInt]]] = [{"id": 140000000000001}]  # BC
    public_visibility: Optional[bool] = True
    make_projects_public: Optional[bool] = True
    make_issuances_public: Optional[bool] = True
    make_holdings_public: Optional[bool] = True
    make_retirements_public: Optional[bool] = True
    make_cancellations_public: Optional[bool] = True
    transfer_approval_required: Optional[bool] = True
    disable_outgoing_transfer: Optional[bool] = False
    terms_conditions: Optional[bool] = True

    class Config:
        extra = "forbid"
        str_strip_whitespace = True
