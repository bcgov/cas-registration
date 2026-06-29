###
# This script starts a report for a past year, for a specific operation.
#
# Usage:
#   1) Replace the operation name in the script
#   2) Run `.venv/bin/python manage.py shell < start_report_for_past_year.py`


from registration.models.operation import Operation
from service.report_service import ReportService

operation_name = "<Replace with operation name>"
year = 2024


operation = Operation.objects.get(name=operation_name)
ReportService.create_report(reporting_year=year, operation_id=operation.id)
