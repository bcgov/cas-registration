from dataclasses import dataclass


@dataclass
class ReportPersonResponsibleData:
    contact_id: int
    first_name: str
    last_name: str
    email: str
    phone_number: str
    position_title: str
    business_role: str
    street_address: str
    municipality: str
    province: str
    postal_code: str
