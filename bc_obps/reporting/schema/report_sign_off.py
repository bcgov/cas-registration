from typing import Optional

from ninja import Schema


class ReportSignOffIn(Schema):
    acknowledgement_of_review: bool | None = None
    acknowledgement_of_certification: bool | None = None
    acknowledgement_of_records: bool
    acknowledgement_of_information: bool | None = None
    acknowledgement_of_errors: bool | None = None
    acknowledgement_of_possible_costs: bool | None = None
    acknowledgement_of_new_version: bool | None = None
    acknowledgement_of_corrections: bool | None = None
    signature: str
