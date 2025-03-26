from ninja import Schema


class ReportSignOffAcknowledgements(Schema):
    acknowledgement_of_review: bool
    acknowledgement_of_records: bool
    acknowledgement_of_information: bool | None
    acknowledgement_of_possible_costs: bool
    acknowledgement_of_new_version: bool | None


class ReportSignOffIn(Schema):
    acknowledgements: ReportSignOffAcknowledgements
    signature: str
