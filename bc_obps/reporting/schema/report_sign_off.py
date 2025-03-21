from ninja import Schema


class ReportSignOffIn(Schema):
    acknowledgement_of_review: bool
    acknowledgement_of_records: bool
    acknowledgement_of_information: bool
    acknowledgement_of_impact: bool
    signature: str


class ReportSignOffOut(Schema):
    acknowledgement_of_review: bool
    acknowledgement_of_records: bool
    acknowledgement_of_information: bool
    acknowledgement_of_impact: bool
    signature: str
    date: str
