# Refreshing E-Licensing data on request

This document describes the pattern of refreshing e-licensing data via the API before returning a response.
When a user requests any elicensing data, the system sends a request to elicensing for the invoice. If that request is successful,
the invoice data in BCIERS and all of the child data (line_item, payment, adjustment) is updated in the BCIERS system.
The data is then returned from the BCIERS models, which allows us to follow familiar querying patterns and provides reliable responses even if the e-licensing system is down.
If the request from e-licensing is unsucessful, the data is returned from the BCIERS models with a flag that warns that the request to the 3rd party API was unsuccessful & the data may not be fully up to date.

## Model Architecture

BCIERS has its own models that mirror the objects returned by the elicensing API:
[`elicensing_invoice`, `elicensing_line_item` (fee), `elicensing_payment`, `elicensing_adjustment`]
Along with the model `elicensing_client_operator`, which defines the link between an Operator in BCIERS and a "client" in elicensing.

## Refresh Function & Wrapper(s)

The e-licensing refresh service (bc_obps/compliance/service/elicensing/elicensing_data_refresh_service) contains the main function `refresh_data_by_invoice` which performs the query to the elicensing API & updates the BCIERS data from the response. The service also contains a wrapper `refresh_data_wrapper_by_compliance_report_version_id` that uses the compliance_report_version_id to fetch the correct invoice, attempt the communication with the e-licensing API, update records if successful and returns the BCIERS invoice record & a flag if unsuccessful.

## Example Usage

If a service requires e-licensing data, it should first call the wrapper & save the boolean return value to a variable. The service should then fetch the required data from the BCIERS models & return the data along with the boolean flag to the API. The flag can in turn be passed to the frontend where a message can be displayed if the communication with e-licensing was not successful.

Example (get payments for an obligation)

```python
def get_compliance_obligation_payments_by_compliance_report_version_id(
        cls, compliance_report_version_id: int
    ) -> PaymentDataWithFreshnessFlag:

        refreshed_data = ElicensingDataRefreshService.refresh_data_wrapper_by_compliance_report_version_id(
            compliance_report_version_id=compliance_report_version_id
        )
        payments = ElicensingPayment.objects.filter(elicensing_line_item__elicensing_invoice=refreshed_data.invoice)

        return PaymentDataWithFreshnessFlag(data_is_fresh=refreshed_data.data_is_fresh, data=payments)
```
