from datetime import datetime
from typing import Annotated, Literal

from pydantic import (
    BaseModel,
    ConfigDict,
    Field,
    NonNegativeInt,
    PositiveFloat,
    PositiveInt,
    model_validator,
)

########## REUSABLE TYPES ##########
FifteenDigitString = Annotated[str, Field(pattern=r"^\d{15}$")]
DateStringField = Annotated[
    str, Field(pattern=r"^\d{4}-\d{2}-\d{2}$|^\d{2}/\d{2}/\d{4}$")
]  # YYYY-MM-DD or DD/MM/YYYY
DateTimeStringField = Annotated[
    str, Field(pattern=r"^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$")
]  # YYYY-MM-DDTHH:MM:SS.sssZ


class Pagination(BaseModel):
    model_config = ConfigDict(
        from_attributes=True
    )  # to build models and look up discriminators using python object
    start: NonNegativeInt | None = 0
    limit: NonNegativeInt | None = 20
    # For sorting, use `.keyword` if the field is a text field otherwise use the field name directly
    sortOptions: list[dict[str, str]] | None = [
        {"sort": "accountName.keyword", "dir": "ASC"}
    ]


class ColumnFilter(BaseModel):
    model_config = ConfigDict(
        from_attributes=True
    )  # to build models and look up discriminators using python object
    filterType: Literal["Number", "Text"]
    type: Literal["equals", "in", "greaterThanOrEqual", "lessThanOrEqual"]
    filter: str | int


CommonFilterType = dict[Literal["columnFilters"], list[ColumnFilter]] | None


class FilterModel(BaseModel):
    model_config = ConfigDict(
        extra="allow", from_attributes=True
    )  # to build models and look up discriminators using python object
    entityId: CommonFilterType = None
    accountId: CommonFilterType = None
    subAccountId: CommonFilterType = None
    masterAccountId: CommonFilterType = None
    accountTypeId: CommonFilterType = None
    accountTypeCode: CommonFilterType = None
    stateCode: CommonFilterType = None
    vintage: CommonFilterType = None
    unitType: CommonFilterType = None
    complianceYear: CommonFilterType = None
    boroId: CommonFilterType = None


class SearchFilter(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    pagination: Pagination | None = Pagination()
    filterModel: FilterModel | dict | None = {}
    groupKeys: list[str] | None = []


class SearchFilterWrapper(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    searchFilter: SearchFilter


class TokenResponse(BaseModel):
    access_token: str
    expires_in: NonNegativeInt
    token_type: str


class PaginatedResponse(BaseModel):
    model_config = ConfigDict(extra="allow")  # Allow extra fields for API flexibility
    totalEntities: NonNegativeInt
    totalPages: NonNegativeInt
    start: NonNegativeInt | None = None
    limit: NonNegativeInt | None = None
    numberOfElements: NonNegativeInt
    first: bool
    last: bool


########## Accounts ##########
class AccountDetailEntity(BaseModel):
    model_config = ConfigDict(extra="allow")  # Allow extra fields for API flexibility
    id: str  # "103100000028577_140000000000001" (accountId + "_" + standardId)
    entityId: NonNegativeInt  # 103100000028577
    standardId: NonNegativeInt  # 140000000000001
    standardName: str  # "BC Carbon Registry"
    accountId: NonNegativeInt  # 103100000028577
    accountName: str  # "General Participant Admin Test"
    mainContactName: str | None = None  # "Kelly Konrad"
    accountTypeName: str | None = None  # "General Participant"
    accountTypeId: NonNegativeInt | None = None  # 10
    type_of_account_holder: str | None = None  # "Corporation"
    masterAccountId: PositiveInt | None = (
        None  # 102000000001000 - Needed for ownership validation
    )
    # Below fields are also part of the response, but we are not interested in them for now except masterAccountId
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


class AccountDetailsResponse(PaginatedResponse):
    model_config = ConfigDict(extra="allow")  # Allow extra fields for API flexibility
    entities: list[AccountDetailEntity]


########## Units ##########
class UnitEntity(BaseModel):
    model_config = ConfigDict(extra="allow")  # Allow extra fields for API flexibility
    id: FifteenDigitString  # "103200000391892"
    entityId: NonNegativeInt  # 103200000391892
    standardId: NonNegativeInt  # 140000000000001
    standardName: str  # "BC Carbon Registry"
    accountId: NonNegativeInt  # 103100000028565
    accountName: str  # "BC Beta Checkout 2 11042025"
    projectId: NonNegativeInt  # 104100000030211
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


class UnitDetailsResponse(PaginatedResponse):
    model_config = ConfigDict(extra="allow")  # Allow extra fields for API flexibility
    entities: list[UnitEntity]


########## Projects ##########
class ProjectPayloadMixedUnit(BaseModel):
    model_config = ConfigDict(extra="forbid", str_strip_whitespace=True)
    city: str | None = None  # "City"
    address_line_1: str | None = None  # "Line 1"
    zipcode: str | None = None  # "H0H0H0"
    province: str | None = None  # "BC"
    latitude: str | None = None  # Latitude of the largest emissions (for SFO)
    longitude: str | None = None  # Longitude of the largest emissions (for SFO)
    period_start_date: DateStringField  # "2025-01-01"
    period_end_date: DateStringField  # "2025-01-31"
    # Optional fields (Default based on the S&P API documentation)
    country_id: FifteenDigitString | None = "100000000000003"  # Canada
    environmental_category_id: FifteenDigitString | None = "100000000000001"  # Carbon
    project_type_id: FifteenDigitString | None = "140000000000002"  # OBPS
    standard_id: FifteenDigitString | None = "140000000000001"  # BCE
    newRecord: bool | None = True

    @model_validator(mode="after")
    def end_date_after_start_date(self) -> "ProjectPayloadMixedUnit":
        start = datetime.strptime(self.period_start_date, "%Y-%m-%d")
        end = datetime.strptime(self.period_end_date, "%Y-%m-%d")
        if end.date() < start.date():
            raise ValueError("period_end_date must be on or after period_start_date")
        return self


class ProjectPayload(BaseModel):
    model_config = ConfigDict(extra="forbid", str_strip_whitespace=True)
    account_id: FifteenDigitString  # "103100000028575"
    project_name: str  # "Test BC Project"
    project_description: str  # "Test BC Project Description" - 2000 characters max
    mixedUnitList: list[ProjectPayloadMixedUnit]
    # Optional fields (Default based on the S&P API documentation)
    newRecord: bool | None = True
    saveAsDraft: bool | None = False
    project_public_visibility: bool | None = True


class ProjectDetailsResponse(BaseModel):
    model_config = ConfigDict(extra="allow")  # Allow extra fields for API flexibility
    id: NonNegativeInt  # 103000000392508
    account_id: NonNegativeInt  # 103100000028575
    project_name: str  # "Test BC Project 3 - Billie Blue"
    project_description: str  # "Test BC Project Description"
    # Response has a lot of other fields, but for now we are only interested in these


########## Transfers ##########
class TransferMixedUnit(BaseModel):
    account_id: FifteenDigitString  # "103100000028575" - Holding account ID
    serial_no: str  # "BC-BCE-IN-104000000037027 - 01032025-30032025-16414-16752-SPG"
    new_quantity: PositiveInt  # 1
    id: FifteenDigitString  # "103200000396923" - entityId of the unit
    do_action: bool | None = True  # Always true


class TransferPayload(BaseModel):
    model_config = ConfigDict(extra="forbid", str_strip_whitespace=True)
    destination_account_id: (
        FifteenDigitString  # "103000000036531" - Receiving account ID
    )
    mixedUnitList: list[TransferMixedUnit]


######## Issuance ##########
class IssuancePayloadMixedUnit(BaseModel):
    holding_quantity: PositiveInt  # 100
    vintage_start: (
        DateTimeStringField  # "2025-01-01T00:00:00Z" - CompliancePeriod start date
    )
    vintage_end: (
        DateTimeStringField  # "2025-01-31T00:00:00Z" - CompliancePeriod end date
    )
    city: str | None = None  # "City" - from project->mixedUnitList[0].city
    address_line_1: str | None = (
        None  # "Line 1" - from project->mixedUnitList[0].address_line_1
    )
    zipcode: str | None = None  # "H0H0H0" - from project->mixedUnitList[0].zipcode
    latitude: str | None = None  # "49.2827" - from project->mixedUnitList[0].latitude
    longitude: str | None = (
        None  # "-123.1207" - from project->mixedUnitList[0].longitude
    )
    defined_unit_id: (
        FifteenDigitString  # "103000000392535" - project->mixedUnitList[0].id
    )
    project_type_id: FifteenDigitString  # "140000000000002"  # project->mixedUnitList[0].project_type_id
    # Default Fields (based on the S&P API documentation)
    state_name: str | None = "NEW"
    public_visibility: bool | None = False
    standard_id: FifteenDigitString | None = "140000000000001"  # BC
    country_id: FifteenDigitString | None = "100000000000003"  # Canada


class IssuancePayloadVerification(BaseModel):
    verificationStartDate: (
        DateStringField  # "2025-01-01" - when director clicks approve
    )
    verificationEndDate: DateStringField  # "2025-01-31" - when director clicks approve
    monitoringPeriod: (
        str  # "01/01/2025 - 31/01/2025" - (verificationStartDate - verificationEndDate)
    )
    mixedUnits: list[IssuancePayloadMixedUnit]


class IssuancePayload(BaseModel):
    model_config = ConfigDict(extra="forbid", str_strip_whitespace=True)
    account_id: FifteenDigitString  # "103100000028575"
    issuance_requested_date: DateTimeStringField  # "2025-01-24T13:13:28.547Z" - as soon as user request the issuance
    project_id: FifteenDigitString  # "104000000036500"
    verifications: list[IssuancePayloadVerification]
    # Hardcoded fields based on the S&P API documentation
    unit_type_id: FifteenDigitString | None = (
        "140000000000001"  # "140000000000001" - BCE
    )
    system_state: str | None = "CUSTOMER_INITIATED"
    newRecord: bool | None = True


####### SubAccount ########
class SubAccountPayload(BaseModel):
    model_config = ConfigDict(extra="forbid", str_strip_whitespace=True)
    master_account_id: FifteenDigitString  # "103000000037199"
    compliance_year: PositiveInt  # 2025
    organization_classification_id: FifteenDigitString  # "100000000000096" - organizationClassificationId from account details
    type_of_organization: Literal[
        "140000000000001", "140000000000002", "140000000000003"
    ]  # type_of_account_holder from master account (Corporation)
    registered_name: str  # Operation name + BORO ID + " - " + compliance year
    boro_id: str = Field(pattern=r"^\d{2}-\d{4}$")
    # Optional fields (Default based on the S&P API documentation)
    account_type_id: PositiveInt | None = 14  # Compliance
    country_id: FifteenDigitString | None = "100000000000003"  # Canada
    indicatedStandardList: list[dict[str, PositiveInt]] | None = [
        {"id": 140000000000001}
    ]  # BC
    public_visibility: bool | None = True
    make_projects_public: bool | None = True
    make_issuances_public: bool | None = True
    make_holdings_public: bool | None = True
    make_retirements_public: bool | None = True
    make_cancellations_public: bool | None = True
    transfer_approval_required: bool | None = True
    disable_outgoing_transfer: bool | None = False
    terms_conditions: bool | None = True
    newRecord: bool | None = True
