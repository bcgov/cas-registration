class Recipient:
    """
    Represents an email recipient with a full name and email address.
    """

    def __init__(self, full_name: str, email_address: str):
        self.full_name = full_name
        self.email_address = email_address

    def __eq__(self, other: object) -> bool:
        if not isinstance(other, Recipient):
            return NotImplemented
        return self.full_name == other.full_name and self.email_address == other.email_address

    def __repr__(self) -> str:
        return f"Recipient(full_name={self.full_name}, email_address={self.email_address})"
