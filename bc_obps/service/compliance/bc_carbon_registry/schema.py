from datetime import datetime, date
from pydantic import BaseModel, Field, PositiveInt, PositiveFloat, model_validator, NonNegativeInt
from typing import List, Dict, Any, Optional, Annotated, Union, Literal

########## REUSABLE TYPES ##########
DigitString = Annotated[str, Field(pattern=r'^\d+$')]
FifteenDigitString = Annotated[str, Field(pattern=r'^\d{15}$')]


class Pagination(BaseModel):
    start: Optional[NonNegativeInt] = 0
    limit: Optional[NonNegativeInt] = 20
    sortOptions: Optional[List[Dict[str, str]]] = [{"sort": "accountName.keyword", "dir": "ASC"}]


class ColumnFilter(BaseModel):
    filterType: Literal["Number", "Text"]
    type: Literal["equals", "in"]
    filter: Union[FifteenDigitString, DigitString]


class FilterModel(BaseModel):
    entityId: Optional[Dict[Literal["columnFilters"], List[ColumnFilter]]] = None
    accountTypeId: Optional[Dict[Literal["columnFilters"], List[ColumnFilter]]] = None
    masterAccountId: Optional[Dict[Literal["columnFilters"], List[ColumnFilter]]] = None
    accountId: Optional[Dict[Literal["columnFilters"], List[ColumnFilter]]] = None


class SearchFilter(BaseModel):
    pagination: Pagination
    filterModel: Union[FilterModel, dict] = {}
    groupKeys: Optional[List[str]] = []


class TokenResponse(BaseModel):
    access_token: str
    expires_in: NonNegativeInt
    token_type: str


class PaginatedResponse(BaseModel):
    totalEntities: NonNegativeInt
    totalPages: NonNegativeInt
    start: Optional[NonNegativeInt] = None
    limit: Optional[NonNegativeInt] = None
    numberOfElements: NonNegativeInt
    first: bool
    last: bool

    class Config:
        extra = "allow"  # Allow extra fields for API flexibility


class GenericResponse(BaseModel):
    success: bool
    result: Dict[str, Any]

    class Config:
        extra = "allow"  # Allow extra fields for API flexibility


########## Accounts ##########
class AccountDetailEntity(BaseModel):
    id: str  # "103100000028577_140000000000001" (accountId + "_" + standardId)
    entityId: FifteenDigitString  # 103100000028577
    standardId: FifteenDigitString  # 140000000000001
    standardName: str  # "BC Carbon Registry"
    accountId: FifteenDigitString  # 103100000028577
    accountName: str  # "General Participant Admin Test"
    mainContactName: str  # "Kelly Konrad"
    accountTypeName: str  # "General Participant"
    accountTypeId: PositiveInt  # 10
    type_of_account_holder: str  # "Corporation"
    # Below fields are also part of the response, but we are not interested in them for now
    # masterAccountId: Optional[PositiveInt] = None  # 102000000001000
    # masterAccountName: Optional[str] = None  # "British Columbia Government Account"
    # billingContactEmail: Optional[str] = None  # "someone.email@gov.bc.ca"
    # auxiliaries: Optional[Any] = None  # None
    # organizationClassificationId: Optional[FifteenDigitString] = None  # "100000000000097"
    # organizationClassification: Optional[str] = None  # "Broker/Trader/Retailer"
    # modifiedDate: Optional[datetime] = None  # "2025-04-16T20:21:48.26"
    # esUpdatedOn: Optional[datetime] = None  # "2025-04-16T20:21:48.530988557"
    # countryName: Optional[str] = None  # "Canada"
    # countryId: Optional[FifteenDigitString] = None  # "100000000000003"
    # stateName: Optional[str] = None  # "Active"
    # stateCode: Optional[str] = None  # "ACTIVE"
    # website: Optional[AnyUrl] = None  # "www.generaladminparticipant.com"
    # publicVisibility: Optional[bool] = None  # true
    # hasChildren: Optional[bool] = None  # false
    # activatedDate: Optional[datetime] = None  # "2025-04-16T20:21:46"
    # submittedDate: Optional[datetime] = None  # "2025-04-16T17:53:14"
    # accountManagerEmail: Optional[str] = None  # "manager.email@gov.bc.ca"

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
    standardId: PositiveInt  # 140000000000001
    standardName: str  # "BC Carbon Registry"
    accountId: PositiveInt  # 103100000028565
    accountName: str  # "BC Beta Checkout 2 11042025"
    projectId: PositiveInt  # 104100000030211
    holdingQuantity: PositiveFloat  # 2.0
    serialNo: str  # "BC-BCO-KH-104100000030211-11042025-12042025-1-2-SPG"
    unitMeasurementName: str  # "tCO2e"
    unitType: str  # "BCO"
    className: str  # "BCO"
    # Below fields are also part of the response, but we are not interested in them for now
    # esUpdatedOn: datetime  # "2025-04-12T00: #55: #40.446122835"
    # modifiedDate: datetime  # "2025-04-11T18: #11: #13.66"
    # countryName: str  # "Cambodia"
    # countryId: FifteenDigitString  # "100000000000123"
    # projectTypeName: str  # "Emissions Reduction"
    # stateName: str  # "Retired"
    # stateCode: str  # "RETIRED"
    # projectName: str  # "BC Project Beta Chekcout 1 11042025"
    # vintage: DigitString  # "2025"
    # publicVisibility: bool  # true
    # doAssign: bool  # false
    # doRetire: bool  # false
    # doExchangeListing: bool  # false
    # doGenericCancel: bool  # false
    # isBuffer: bool  # false
    # doRfi: bool  # false
    # doNotDeliver: bool  # false
    # accountTypeCode: str  # "PROJECT_PROPONENT"
    # auxiliaries: Optional[Any]  # None

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
    country_id: Optional[FifteenDigitString] = "100000000000003"  # Canada
    environmental_category_id: Optional[FifteenDigitString] = "100000000000001"  # Carbon
    project_type_id: Optional[FifteenDigitString] = "140000000000002"  # OBPS
    standard_id: Optional[FifteenDigitString] = "140000000000001"  # BC
    newRecord: Optional[bool] = True

    @model_validator(mode='after')
    def end_date_after_start_date(self) -> 'ProjectPayloadMixedUnit':
        if self.period_end_date < self.period_start_date:
            raise ValueError('period_end_date must be on or after period_start_date')
        return self


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
    id: FifteenDigitString  # 103000000392508
    account_id: FifteenDigitString  # "103100000028575"
    project_name: str  # "Test BC Project 3 - Billie Blue"
    project_description: str  # "Test BC Project Description"
    # Response has a lot of other fields, but for now we are only interested in these

    class Config:
        extra = "allow"


########## Transfers ##########
class TransferMixedUnit(BaseModel):
    account_id: FifteenDigitString  # "103100000028575" // Holding account ID
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
    defined_unit_id: FifteenDigitString  # 103000000392535 //project->mixedUnitList[0].id
    # Optional fields (Default based on the S&P API documentation)
    public_visibility: Optional[bool] = False
    standard_id: Optional[FifteenDigitString] = "140000000000001"  # BC
    country_id: Optional[FifteenDigitString] = "100000000000003"  # Canada
    project_type_id: Optional[FifteenDigitString] = "100000000000117"  # OBPS


class IssuancePayloadVerification(BaseModel):
    verificationStartDate: date  # "2025-01-01"
    verificationEndDate: date  # "2025-01-31"
    monitoringPeriod: str  # "01/01/2025 - 31/01/2025"
    verifierId: PositiveInt  # 204
    mixedUnits: List[IssuancePayloadMixedUnit]


class IssuancePayload(BaseModel):
    account_id: FifteenDigitString  # "103100000028575"
    issuance_requested_date: datetime  # "2025-01-24T13:13:28.547Z"
    project_id: FifteenDigitString  # "104000000036500"
    unit_type_id: FifteenDigitString  # "140000000000001" # BCE
    verifications: List[IssuancePayloadVerification]

    class Config:
        extra = "forbid"
        str_strip_whitespace = True  # Strip whitespace from strings


####### SubAccount ########
class SubAccountPayload(BaseModel):
    organization_classification_id: FifteenDigitString  # 100000000000097 // organizationClassificationId from master account
    compliance_year: PositiveInt  # 2025
    registered_name: str  # "Test BC Subaccount 31 Mar 2"
    master_account_id: FifteenDigitString  # 103000000037199
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
