# Compliance Architecture Refactoring Plan

## Current Architecture Analysis

The current architecture has several decoupled models but could be improved for better integration with eLicensing:

- Report → Report Version → Compliance Summary → Compliance Obligation → Compliance Fee
- Separate integration with eLicensing happens after fee creation
- Multiple service classes handle different aspects (fee creation, eLicensing integration)

## Proposed Changes

### 1. Model Updates

#### ComplianceObligation Model
- Merge ComplianceFee into ComplianceObligation to simplify the architecture
  - Add fee-related fields directly to ComplianceObligation:
    - `fee_amount` (Decimal)
    - `fee_rate` (Decimal) - Store the actual rate used (80$ for 2024, variable in future)
    - `fee_status` (choices field)
    - `fee_date` (DateField)
  - Use the existing ELicensingLink model for all eLicensing relationships instead of directly embedding IDs
  - This leverages the generic relationship capability already in place

#### ComplianceSummary Model
- Ensure it properly captures excess emissions calculation
- Add a trigger mechanism for obligation creation

### 2. Service Layer Restructuring

#### Existing Services to Enhance or Extend

We'll leverage and extend existing services instead of creating entirely new ones where possible:

##### ComplianceObligationService
Extend the existing service:
```python
class ComplianceObligationService:
    @classmethod
    @transaction.atomic
    def create_obligation(cls, compliance_summary_id: int) -> Optional[ComplianceObligation]:
        """
        Create a compliance obligation for a compliance summary with excess emissions.
        
        Args:
            compliance_summary_id: ID of the compliance summary
            
        Returns:
            The created ComplianceObligation if successful, None otherwise
        """
        # 1. Get compliance summary
        # 2. Calculate fee amount (excess emissions * fee rate)
        # 3. Create ComplianceObligation with fee data
        # 4. Trigger eLicensing integration on_commit
        # 5. Return the ComplianceObligation
    
    @classmethod
    def get_fee_rate_for_year(cls, year: int) -> Decimal:
        """
        Get the fee rate for a specific year.
        
        Args:
            year: The reporting/compliance year
            
        Returns:
            The fee rate in dollars per tonne
        """
        # Return the appropriate fee rate for the year
        # 80$ for 2024, with logic for future years
```

##### ComplianceSummaryService
Enhance the existing service to trigger obligation creation:
```python
class ComplianceSummaryService:
    @classmethod
    @transaction.atomic
    def process_report_submission(cls, report_version_id: int) -> ComplianceSummary:
        """
        Process a submitted report version and create/update compliance summary.
        
        Args:
            report_version_id: ID of the submitted report version
            
        Returns:
            The created/updated ComplianceSummary
        """
        # 1. Get report version
        # 2. Calculate compliance metrics (emissions, limits, etc.)
        # 3. Create or update ComplianceSummary
        # 4. If excess emissions exist, trigger ComplianceObligationService
        # 5. Return the ComplianceSummary
```

##### ObligationELicensingService
Extend the existing service to handle the full flow:
```python
class ObligationELicensingService:
    @classmethod
    def process_obligation(cls, obligation_id: int) -> bool:
        """
        Process a compliance obligation in eLicensing.
        
        Args:
            obligation_id: ID of the compliance obligation
            
        Returns:
            True if successful, False otherwise
        """
        # 1. Get obligation
        # 2. Ensure client exists in eLicensing using OperatorELicensingService
        # 3. Create fee in eLicensing using sync_fee_with_elicensing
        # 4. Create invoice in eLicensing using sync_invoice_with_elicensing
        # 5. Return success status
    
    @classmethod
    def sync_fee_with_elicensing(cls, obligation_id: int, client_link: ELicensingLink) -> Optional[ELicensingLink]:
        """
        Creates a fee in eLicensing for a compliance obligation.
        
        Args:
            obligation_id: The ID of the compliance obligation
            client_link: The ELicensingLink for the client
            
        Returns:
            The ELicensingLink object for the fee if successful, None otherwise
        """
        # Create fee and link
        
    @classmethod
    def sync_invoice_with_elicensing(cls, obligation_id: int, client_link: ELicensingLink, fee_link: ELicensingLink) -> Optional[ELicensingLink]:
        """
        Creates an invoice in eLicensing for a compliance obligation.
        
        Args:
            obligation_id: The ID of the compliance obligation
            client_link: The ELicensingLink for the client
            fee_link: The ELicensingLink for the fee
            
        Returns:
            The ELicensingLink object for the invoice if successful, None otherwise
        """
        # Create invoice and link
```

#### Reusing Existing Services
- `OperatorELicensingService` - Reuse for client creation/management
- `ELicensingLinkService` - Reuse for managing links between entities and eLicensing objects
- `ELicensingAPIClient` - Extend for invoice creation functionality

### 3. Transaction and Error Handling

- Use `transaction.atomic` for database operations
- Use `transaction.on_commit` for eLicensing integration to prevent rollbacks affecting core data
- Implement robust error handling and logging
- Create background tasks for retrying failed eLicensing operations

```python
# Example of transaction handling
@transaction.atomic
def process_report_submission(report_version_id):
    # Core business logic
    compliance_summary = create_compliance_summary(report_version_id)
    
    if compliance_summary.excess_emissions > 0:
        obligation = create_obligation(compliance_summary.id)
        
        # Schedule external integration after transaction commit
        transaction.on_commit(lambda: process_elicensing_integration.delay(obligation.id))
    
    return compliance_summary
```

### 4. API Integration

Enhance `ELicensingAPIClient` to support:

1. Client Creation (for operators) - Already implemented
   ```python
   def create_client(self, client_data: Dict[str, Any]) -> ClientCreationResponse:
       """Creates a new client in eLicensing system."""
       # Implementation
   ```

2. Fee Creation (for obligations) - Already implemented
   ```python
   def create_fees(self, client_id: str, fees_data: FeeCreationRequest) -> FeeResponse:
       """Creates fee records for a specified client."""
       # Implementation
   ```

3. Invoice Creation (for obligations) - Need to implement
   ```python
   def create_invoice(self, invoice_data: Dict[str, Any]) -> Dict[str, Any]:
       """Creates an invoice in eLicensing."""
       # Implementation
   ```

### 5. Migration Strategy

1. Create new models/fields
   - Add fee fields to ComplianceObligation
   - Update ELicensingLink for invoice tracking (add new ObjectKind if needed)

2. Migrate existing data
   - Move data from ComplianceFee to ComplianceObligation
   - Create ELicensingLink entries for existing fee records

3. Update services to use new structure
   - Refactor existing services
   - Add new methods to existing services

4. Add tests for new functionality
   - Unit tests for each service
   - Integration tests for the complete flow

## Implementation Plan

### Phase 1: Model Refactoring
- Update ComplianceObligation model to include fee-related fields
- Ensure ELicensingLink supports all required relationship types
- Create migration for model changes
- Update existing services to work with the new model structure

### Phase 2: Service Layer Implementation
- Enhance ComplianceSummaryService to process report submissions and trigger obligation creation
- Extend ComplianceObligationService with fee calculation logic
- Extend ObligationELicensingService to handle the full eLicensing integration flow

### Phase 3: eLicensing Integration
- Enhance ELicensingAPIClient for invoice creation
- Implement full client-obligation-fee-invoice flow in ObligationELicensingService

### Phase 4: Testing and Validation
- Add unit tests for all components
- Add integration tests for the complete flow
- Verify eLicensing integration works correctly

## Recommendation

Consolidating ComplianceObligation and ComplianceFee into a single model simplifies the architecture while maintaining proper separation of concerns through the service layer. 

Using the ELicensingLink model for all eLicensing relationships instead of embedding identifiers directly in ComplianceObligation provides more flexibility and reuses existing patterns in the codebase.

The proposed architecture leverages existing services where possible, extending them only where needed, which reduces development effort and maintains consistency.

### Data Flow Diagram

```
Report Submission → Report Version
       ↓
ComplianceSummaryService.process_report_submission()
       ↓
Excess Emissions? → No → End
       ↓ Yes
ComplianceObligationService.create_obligation()
       ↓ (transaction.on_commit)
ObligationELicensingService.process_obligation()
       ↓
1. OperatorELicensingService.sync_client_with_elicensing()
       ↓
2. ObligationELicensingService.sync_fee_with_elicensing()
       ↓
3. ObligationELicensingService.sync_invoice_with_elicensing()
       ↓
4. ELicensingLinkService creates links between entities
``` 