from ninja import Schema


# Generic schemas
class Message(Schema):
    message: str


class Count(Schema):
    count: int
