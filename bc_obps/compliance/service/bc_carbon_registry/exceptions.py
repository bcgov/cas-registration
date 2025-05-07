from typing import Optional


class BCCarbonRegistryError(Exception):
    def __init__(self, message: str, status_code: Optional[int] = None, endpoint: Optional[str] = None):
        self.message = message
        self.status_code = status_code
        self.endpoint = endpoint
        super().__init__(self.message)

    def __str__(self) -> str:
        """
        Return a string representation of the error.
        Useful if we want to customize the error message.
        """
        parts = [self.message]
        if self.status_code:
            parts.append(f"status_code={self.status_code}")
        if self.endpoint:
            parts.append(f"endpoint={self.endpoint}")
        return ", ".join(parts)
