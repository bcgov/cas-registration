from typing import Optional

from ninja import Schema


class ReportSignOffIn(Schema):
    acknowledgement_of_review: Optional[bool] = None
    acknowledgement_of_certification: Optional[bool] = None
    acknowledgement_of_records: bool
    acknowledgement_of_information: Optional[bool] = None
    acknowledgement_of_errors: Optional[bool] = None
    acknowledgement_of_possible_costs: Optional[bool] = None
    acknowledgement_of_new_version: Optional[bool] = None
    acknowledgement_of_corrections: Optional[bool] = None
    signature: str
